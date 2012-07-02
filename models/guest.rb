class Guest
  include Mongoid::Document
  
  field :first_name, :type => String
  field :last_name, :type => String
  field :last_name_lower, :type => String # recommended hack for case insensitive sorting
  field :email, :type => String
  field :group, :type => String
  field :type, :type => String
  field :checked_in, :type => Boolean, :default => false

  index({:group => 1})
  index({:first_name => 1, :last_name => 1})
end
