import type { Plugin } from 'chart.js'

/*
 * Adapted from the HTML legend example given by chart.js:
 * https://www.chartjs.org/docs/latest/samples/legend/html.html
 */

const getOrCreateLegendList = (id: string) => {
  const legendContainer = document.getElementById(id)
  if (legendContainer == null) return
  let listContainer = legendContainer.querySelector('ul')

  if (!listContainer) {
    listContainer = document.createElement('ul')
    listContainer.style.display = 'flex'
    listContainer.style.flexDirection = 'column'
    listContainer.style.margin = '0'
    listContainer.style.padding = '0'
    listContainer.style.maxHeight = '8rem'

    legendContainer.appendChild(listContainer)
  }

  return listContainer
}

export const htmlLegendPlugin: Plugin = {
  id: 'htmlLegend',
  afterUpdate(chart, _, options) {
    const ul = getOrCreateLegendList(options.containerID)
    if (!ul) return

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove()
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins?.legend?.labels?.generateLabels?.(chart)
    if (!items) return

    items.forEach((item) => {
      const li = document.createElement('li')
      li.style.alignItems = 'center'
      li.style.cursor = 'pointer'
      li.style.display = 'flex'
      li.style.flexDirection = 'row'
      li.style.marginLeft = '10px'

      li.onclick = () => {
        // @ts-ignore
        const { type } = chart.config
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index || 0)
        } else {
          chart.setDatasetVisibility(
            item.datasetIndex || 0,
            !chart.isDatasetVisible(item.datasetIndex || 0)
          )
        }
        chart.update()
      }

      const boxSpan = document.createElement('span')
      boxSpan.style.background = item.fillStyle?.toString() || ''
      boxSpan.style.borderColor = item.strokeStyle?.toString() || ''
      boxSpan.style.borderWidth = item.lineWidth + 'px'
      boxSpan.style.display = 'inline-block'
      boxSpan.style.flexShrink = '0'
      boxSpan.style.height = '20px'
      boxSpan.style.marginRight = '10px'
      boxSpan.style.width = '20px'

      const textContainer = document.createElement('p')
      textContainer.style.color = item.fontColor?.toString() || ''
      textContainer.style.margin = '0'
      textContainer.style.padding = '0'
      textContainer.style.textDecoration = item.hidden ? 'line-through' : ''
      textContainer.style.width = 'max-content'

      const text = document.createTextNode(item.text)
      textContainer.appendChild(text)

      li.appendChild(boxSpan)
      li.appendChild(textContainer)
      ul.appendChild(li)
    })
  }
}
