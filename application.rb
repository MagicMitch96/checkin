require 'rubygems'
require 'sinatra'
require 'lib/models'

use Rack::Auth::Basic do |username, password|
  [username, password] == [ENV['ADMIN_USERNAME'], ENV['ADMIN_PASSWORD']]
end

get '/' do
  redirect '/individuals'
  erb :alpha, :layout => !request.xhr?
end

get '/individuals' do
  erb :alpha, :layout => !request.xhr?
end

get '/individuals/alpha/:letter' do
  @scope = params[:letter].upcase
  @people = Attendee.all(:conditions => ["last_name ILIKE ?", "#{@scope}%"], :order => [:last_name.asc])
  erb :scoped_people, :layout => !request.xhr?
end

get '/individuals/search' do
  @query = params[:query]
  @people = Attendee.all(:conditions => ["last_name ILIKE ? OR first_name ILIKE ?", "%#{@query}%", "%#{@query}%"], :order => [:last_name.asc]) unless @query == ''
  erb :search_people, :layout => !request.xhr?
end

get '/groups' do
  erb :alpha, :layout => !request.xhr?
end

get '/groups/alpha/:letter' do
  @scope = params[:letter].upcase  
  @groups = Attendee.all(:fields => [:group], :unique => true, :conditions => ["\"group\" ILIKE ?", "#{@scope}%"], :order => [:group.asc])
  erb :scoped_groups, :layout => !request.xhr?
end

get '/groups/search' do
  @query = params[:query]
  @groups = Attendee.all(:fields => [:group], :unique => true, :conditions => ["\"group\" ILIKE ?", "%#{@query}%"], :order => [:group.asc]) unless @query == ''
  erb :search_groups, :layout => !request.xhr?
end

get '/groups/:group' do
  @scope = params[:group].gsub('-', ' ')
  @people = Attendee.all(:group => @scope, :order => [:last_name.asc])
  erb :scoped_people, :layout => !request.xhr?
end

get '/more' do
  erb :more, :layout => !request.xhr?
end

# accessbile from desktop browser for setup

get '/import' do
  erb :import, :layout => false
end

post '/process' do
  parsed_file = CSV.parse(params[:file][:tempfile])
  n = 0
  parsed_file.each do |row| 
    a = Attendee.new
    a.attributes = {
      :first_name => row[0],
      :last_name => row[1],
      :email => row[2],
      :group => row[3],
      :type => row[4]
    }
    if a.save
      n += 1
      GC.start if n%50 == 0
    end
  end
  "CSV import successful.  #{n} new records were added to the database."
end