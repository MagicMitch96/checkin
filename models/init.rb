require 'mongoid'

Mongoid.load!(File.expand_path('..', File.dirname(__FILE__)) + "/config/mongoid.yml")

require_relative 'guest'
