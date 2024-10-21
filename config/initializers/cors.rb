Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'  # Adjust origin as needed for production
      resource '*',
               headers: :any,
               methods: [:get, :post, :options]
    end
  end
  