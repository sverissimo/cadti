//@ts-check
import { useState, useEffect } from 'react'

export function useShareSum() {
  const [share, setShare] = useState(0)

  const shareInputs = document.querySelectorAll('input[name=share]')
  const deletedInputs = document.querySelectorAll('input[style*="text-decoration: line-through"][name=share]')
  //@ts-ignore
  const totalShare = [...shareInputs].reduce((prev, cur) => prev += Number(cur.value), 0)
  //@ts-ignore
  const deletedShare = [...deletedInputs].reduce((prev, cur) => prev += Number(cur.value), 0)

  useEffect(() => {
    setShare(totalShare - deletedShare)
  }, [shareInputs])

  return share
}
