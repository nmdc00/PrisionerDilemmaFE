class CreatePlayers < ActiveRecord::Migration[7.0]
  def change
    create_table :players do |t|
      t.string :address
      t.integer :round_joined

      t.timestamps
    end
  end
end
