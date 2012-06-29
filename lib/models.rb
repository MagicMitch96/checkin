require 'rubygems'
require 'mongoid'


Mongoid.load!(File.expand_path('..', File.dirname(__FILE__)) + "/config/mongoid.yml")

class Guest
  include Mongoid::Document
  
  field :first_name, :type => String
  field :last_name, :type => String
  field :last_name_lower, :type => String # recommended hack for case insensitive sorting
  field :email, :type => String
  field :group, :type => String
  field :type, :type => String
  field :checked_in, :type => Boolean, :default => false
end
