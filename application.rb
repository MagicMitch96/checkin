require 'rubygems'
require 'sinatra'
require 'cgi'
require 'yaml'
require './lib/models'



enable :sessions

use Rack::Auth::Basic do |username, password|
  [username, password] == [ENV['ADMIN_USERNAME'], ENV['ADMIN_PASSWORD']]
end



helpers do
  def partial(template, *args)
    template_array = template.to_s.split('/')
    template = template_array[0..-2].join('/') + "/_#{template_array[-1]}"
    options = args.last.is_a?(Hash) ? args.pop : {}
    options.merge!(:layout => false)    
    erb(:"#{template}", options)
  end
  
  def escape_special(string)
    CGI.escape(string)
  end
  
  def unescape_special(string)
    CGI.unescape(string)
  end
  
  def guest_type_element(guest_type, element)
    if @guest_types[guest_type] && @guest_types[guest_type][element]
      @guest_types[guest_type][element]
    else
      default_guest_type_element(guest_type, element)
    end
  end
end



before do
  # everything except the import page is only accessible from mobile browsers
  unless request.user_agent.downcase.include? 'mobile'
    redirect '/import' unless (request.path == '/import' || request.path == '/process' || request.path == '/reset_db')
  end
  
  # flash messages
  if session[:flash]
    @flash = session[:flash]
    session[:flash] = nil
  end
  
  load_guest_types
end



get '/' do
  redirect '/individuals'
end


get '/individuals' do
  erb :alpha, :layout => !request.xhr?
end

get '/individuals/alpha/:letter' do
  @scope = params[:letter].upcase
  @guests = Guest.all(:conditions => ["last_name ILIKE ?", "#{@scope}%"], :order => [:last_name.asc])
  erb :scoped_guests, :layout => !request.xhr?
end

get '/individuals/type/:type' do
  @scope = unescape_special(params[:type])
  @guests = Guest.all(:conditions => ["type = ?", "#{@scope}"], :order => [:last_name.asc])
  @scope.capitalize!
  erb :scoped_guests, :layout => !request.xhr?
end

get '/individuals/search' do
  @query = params[:query]
  @guests = Guest.all(:conditions => ["last_name ILIKE ? OR first_name ILIKE ?", "%#{@query}%", "%#{@query}%"], :order => [:last_name.asc]) unless @query == ''
  erb :search_guests, :layout => !request.xhr?
end


post '/checkin' do
  @guest = Guest.get(params[:id])
  @guest.update(:checked_in => true)
end

post '/checkout' do
  @guest = Guest.get(params[:id])
  @guest.update(:checked_in => false)
end


get '/groups' do
  erb :alpha, :layout => !request.xhr?
end

get '/groups/alpha/:letter' do
  @scope = params[:letter].upcase
  @groups = repository(:default).adapter.select('SELECT DISTINCT "group" FROM guests WHERE "group" ILIKE ? ORDER BY "group" ASC', "#{@scope}%")
  erb :scoped_groups, :layout => !request.xhr?
end

get '/groups/search' do
  @query = params[:query]
  @groups = repository(:default).adapter.select('SELECT DISTINCT "group" FROM guests WHERE "group" ILIKE ? ORDER BY "group" ASC', "%#{@query}%") unless @query == ""
  erb :search_groups, :layout => !request.xhr?
end

get '/groups/:group' do
  @scope = unescape_special(params[:group])
  @guests = Guest.all(:group => @scope, :order => [:last_name.asc])
  erb :scoped_guests, :layout => !request.xhr?
end


get '/more' do
  @guests = Guest.all(:fields => [:id, :checked_in, :type])
  @types = repository(:default).adapter.select('SELECT DISTINCT "type" FROM guests WHERE "type" <> ? ORDER BY "type" ASC', "")
  erb :more, :layout => !request.xhr?
end


# accessbile from desktop browser for setup

get '/import' do
  erb :import, :layout => :desktop
end

post '/process' do
  if params[:file]
    parsed_file = CSV.parse(params[:file][:tempfile])
    parsed_file.shift
    n = 0
    parsed_file.each do |row| 
      g = Guest.new
      g.attributes = {
        :first_name => row[0],
        :last_name => row[1],
        :email => row[2],
        :group => row[3],
        :type => row[4]
      }
      if g.save
        n += 1
        GC.start if n%50 == 0
      end
    end
    session[:flash] = { :type => 'notice', :message => "CSV import successful.  #{n} new records were added to the database." }
  else
    session[:flash] = { :type => 'error', :message => "Please select a file to import." }
  end
  redirect '/import'
end

post '/reset_db' do
  Guest.all.destroy
  session[:flash] = { :type => 'notice', :message => "Successfully reset the database." }
  redirect '/import'
end


private #-----------------

def load_guest_types
  @guest_types ||= YAML.load(File.read("./config/guest_types.yml"))
end

def default_guest_type_element(guest_type, element)
  case element
  when "abbr"
    guest_type[0..1].upcase
  else
    guest_type.gsub(/(?![A-Za-z_])./, '')
  end
end