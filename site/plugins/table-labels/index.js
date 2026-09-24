// Quartz transformer: for every table, copy the header text of each column
// onto the matching body cells as `data-label`. The site's custom.scss uses
// that attribute to show "欄名 值" lines when a wide table is rendered as
// stacked cards on narrow screens. No dependencies: the hast tree is walked by
// hand so the plugin can be loaded straight from this directory.

const textOf = (node) => {
  if (node.type === "text") return node.value
  return (node.children ?? []).map(textOf).join("")
}

const elements = (node, tagName) =>
  (node.children ?? []).filter((c) => c.type === "element" && c.tagName === tagName)

const labelTable = (table) => {
  const [thead] = elements(table, "thead")
  const [headerRow] = thead ? elements(thead, "tr") : []
  if (!headerRow) return
  const labels = elements(headerRow, "th").map((th) => textOf(th).trim())
  for (const tbody of elements(table, "tbody")) {
    for (const tr of elements(tbody, "tr")) {
      elements(tr, "td").forEach((td, i) => {
        if (labels[i]) td.properties = { ...td.properties, "data-label": labels[i] }
      })
    }
  }
}

const walk = (node) => {
  if (node.type === "element" && node.tagName === "table") labelTable(node)
  for (const child of node.children ?? []) walk(child)
}

const TableLabels = () => ({
  name: "TableLabels",
  htmlPlugins() {
    return [() => (tree) => walk(tree)]
  },
})

export default TableLabels
export { TableLabels }
