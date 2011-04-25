require 'rubygems'
require 'sinatra'
require 'lib/models'


get '/import' do
  erb :import
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