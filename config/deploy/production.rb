# production.rb
set :rails_env, :production

# Настраиваем ssh до сервера
server "52.56.203.247", :app, :web, :db, :primary => true

# Авторизационные данные
set :user, "earvi-dev"
set :group, "earvi-dev"
set :keep_releases, 5
set :repository, 'prod'
