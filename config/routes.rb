Rails.application.routes.draw do
  root "game#index"  # Serve the game view on the root path

  resources :players, only: [] do
    collection do
      post :join         # Route for joining the game
      get :check_join_status  # Route for checking if already joined
    end
  end
end
