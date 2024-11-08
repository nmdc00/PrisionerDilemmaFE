class Player < ApplicationRecord
  validates :address, presence: true, uniqueness: { scope: :round_joined }
  belongs_to :round

  def joined?(round)
    round == Game.current_round
  end
end
