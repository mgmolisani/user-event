import {configure, getConfig} from '@testing-library/dom'
import userEvent from '#src'
import {render} from '#testHelpers'

test('does not re-wrap internally dispatched events in the configured event wrapper', async () => {
  const {
    elements: [input, other],
  } = render(`<input/><input/>`, {focus: false})

  let depth = 0
  let maxDepth = 0
  const {eventWrapper: originalEventWrapper} = getConfig()
  configure({
    eventWrapper: cb => {
      depth++
      maxDepth = Math.max(maxDepth, depth)
      try {
        return cb()
      } finally {
        depth--
      }
    },
  })

  try {
    const user = userEvent.setup()
    await user.click(input)
    await user.keyboard('hello')
    // Blurring the now-modified field dispatches an internal `change` event.
    await user.click(other)
  } finally {
    configure({eventWrapper: originalEventWrapper})
  }

  expect(maxDepth).toBe(1)
})
