class CreateRounds < ActiveRecord::Migration[7.0]
  def change
    create_table :rounds do |t|
      t.references :game, null: false, foreign_key: true
      t.integer :round_number
      t.datetime :start_time
      t.datetime :end_time
      t.string :status
      t.decimal :total_pot
      t.integer :betrayers_count
      t.integer :cooperators_count

      t.timestamps
    end
  end
end
