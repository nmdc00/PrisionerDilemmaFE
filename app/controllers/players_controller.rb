class PlayersController < ApplicationController
    before_action :set_address_variables, only: [:join, :check_join_status]

    def join 
      byebug
      if Player.joined?(@player_address)
        byebug
        render json: { error: "Player already joined this round" }, status: unprocessable_entity
      else
        Player.create!(address: @player_address, round_joined: @current_round)
        render json: { message: "Player successfulyl joined this round" , current_round: current_round }, status: ok
      end
    end
    
    def check_join_status
      if @player_address.blank?
        render json: { error: "Address parameter is missing" }, status: :unprocessable_entity
        return
      end
  
      joined = current_round.player_joined?(address) if current_round
      render json: { joined: joined || false }
    end

    private

    def set_address_variables
      @player_address = params[:adress]
      @current_round = Game.round
    end
end

