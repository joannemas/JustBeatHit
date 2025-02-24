import React from 'react'

export default function page({ params: { game_name, game_id } }: { params: { game_name: string, game_id: string } }) {
  return (
    <div>{game_name}/{game_id}</div>
  )
}
