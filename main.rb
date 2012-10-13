require 'sinatra'
require 'haml'
require 'sinatra/assetpack'

get '/' do
  haml :index
end
