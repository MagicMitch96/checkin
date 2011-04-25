require 'rubygems'
require 'datamapper'

# DataMapper::Logger.new($stdout, :debug)
DataMapper.setup(:default, ENV['DATABASE_URL'])

class Attendee
  include DataMapper::Resource
  
  property :id,   Serial
  property :first_name, String
  property :last_name, String
  property :email, String
  property :group, String
  property :type, String
  property :checked_in, Boolean, :default => false
end

DataMapper.auto_upgrade!