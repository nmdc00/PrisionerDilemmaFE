class Game < ApplicationRecord
  has_many :rounds, dependent: :destroy
    def self.current_round
      game = Game.first_or_create!(current_round: 1)
      game.current_round
    end

    def self.increment_round
      game = Game.first_or_initialize
      game.current_round += 1
      game.save!
      game.current_round
    end
end
