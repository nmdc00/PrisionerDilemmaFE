class PlayersController < ApplicationController
    before_action :set_address_variables, only: [:join, :check_join_status]

    def join 
      @player = Player.find_or_create_by(address: params[:address])
      if @player.joined?(@current_round)
        render json: { error: "Player has already joined this round." }, status: :unprocessable_entity
      else
        # Logic to add player to the current round
        @player.round_joined = @current_round
        if @player.save
        # Proceed with your logic for joining the game
          render json: { message: "Player joined successfully." }, status: :ok
        else 
          render json: { error: "Failed to join player", messages: @player.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
    
    def check_join_status
      if @player_address.blank?
        render json: { error: "Address parameter is missing" }, status: :unprocessable_entity
        return
      end
      
      render json: { joined: joined || false }
    end

    private

    def set_address_variables
      @player_address = params[:adress]
      @current_round = Game.current_round
    end
end

