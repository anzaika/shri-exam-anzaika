require 'rake/clean'

desc 'Update gh-pages branch'
task :pages => ['pages/.git', 'pages/index.html'] do
  Dir.chdir 'pages' do
    sh "git add ."
    sh "git commit -m 'bump version'" do |ok,res|
      if ok
        verbose { puts "gh-pages updated" }
        sh "git push -q o HEAD:gh-pages"
      end
    end
  end
end
CLEAN.include 'pages/index.html'

# Make index.html a copy of rocco.html
file 'pages/index.html' => 'views/index.haml' do |f|
  sh "haml views/index.haml pages/index.html"
end

# Update the pages/ directory clone
file 'pages/.git' => ['pages/', '.git/refs/heads/gh-pages'] do |f|
  sh "cd docs && git init -q && git remote add o ../.git" if !File.exist?(f.name)
  sh "cd docs && git fetch -q o && git reset -q --hard o/gh-pages && touch ."
end
CLOBBER.include 'docs/.git'


task 'js' do
  sh "uglifyjs2 public/js/modernizr.js public/js/bootstrap.min.js public/js/knockout.js public/js/js-model.js public/js/app.js -o pages/app.js"
end
