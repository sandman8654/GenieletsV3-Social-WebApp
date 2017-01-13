# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.

Rails.application.config.assets.precompile << Proc.new do |path|
  if path =~ /\.*\z/
    full_path = Rails.application.assets.resolve(path).to_path
    nevermind_assets_path = Rails.root.join('vendor', 'assets', 'nevermind').to_path
    fonts_assets_path = Rails.root.join('app', 'assets', 'fonts').to_path
    clipone_assets_path = Rails.root.join('vendor', 'assets', 'clipone').to_path
    if full_path.starts_with?(nevermind_assets_path) || full_path.starts_with?(fonts_assets_path) || full_path.starts_with?(clipone_assets_path)
    # app_assets_path = Rails.root.join('app', 'assets').to_path
    # if full_path.starts_with?(nevermind_assets_path) || full_path.starts_with?(fonts_assets_path) || full_path.starts_with?(app_assets_path)
      true
    else
      false
    end
  else
    false
  end
end

# Rails.application.config.assets.precompile += %w( jquery.js )
# Rails.application.config.assets.precompile += %w( jquery_ujs.js )
# Rails.application.config.assets.precompile += %w( jquery.turbolinks.js )