# Excel Keyboard and Mouse Input, and Formatting

Refer to `File 01 Fundamentals.xlsx` 


**Outcomes**:

- Efficiently use a mouse for input
- Efficiently use a keyboard for input
- Explain and use relative/absolute referencing
- Apply formatting conventions that communicate meaning to a reader.

## Efficient mouse input

1. Distinguish the four click zones of a cell — center (select), border (move), bottom-right corner single-click (drag fill), bottom-right corner double-click (fill to the next break) — and apply the correct one to a given task.
1. Select ranges efficiently using click + `Shift`-click, row/column headers, the select-all corner, and `Ctrl+click` for non-contiguous cells.
1. Use the fill handle to copy a formula down a column and verify that the copied references adjusted correctly.

## Efficient keyboard input

1. Enter and edit data without the mouse using `Enter`, `Shift+Enter`, `Tab`, `Shift+Tab`, `Escape`, and `F2`.
1. Execute the core editing shortcuts — `Ctrl+C` / `X` / `V` / `Z` / `S` / `P` — and the fill shortcuts `Ctrl+D` (fill down) and `Ctrl+R` (fill right).
1. Navigate and select large ranges with `Ctrl+Home`, `Ctrl+End`, `Ctrl+arrows`, `Shift+arrows`, and `Ctrl+Shift+arrows`.
1. Manipulate worksheet structure by keyboard: `Ctrl+Plus` (insert row), `Ctrl+Minus` (delete row), `Shift+Space` (select row), `Ctrl+Space` (select column), `Ctrl+PageUp`/`PageDown` (change sheet).
1. Apply formatting by keyboard using `Ctrl+1` (Format Cells), `Ctrl+Shift+1–5` (number formats), and `Ctrl+K` (hyperlink).
1. Use `F4` to toggle a reference among relative, absolute, and mixed forms.
1. Translate Windows shortcuts to their Mac equivalents (`Control` → `Command`).

## Formula syntax and cell purity

1. Write a syntactically valid formula: begin with `=`, use the operators `+ - * /`, and recognize that spaces are ignored except between a function name and its parenthesis.
1. Explain why hard-coded numbers inside formulas (`=1+2`) are poor practice, and rebuild such a formula so every input lives in its own labeled cell.
1. Keep cells "pure" — separate labels from values (e.g., `10 girls` becomes a text cell and a numeric cell) so the numbers can be used in calculations.
1. Locate global parameters (tax rate, margin, price) in a dedicated block at the top of a worksheet and reference them from the body of the model.

## Relative and absolute references

1. Predict how a relative reference changes when a formula is copied to a new row or column, and explain why the offset relationship is preserved.
1. Choose a relative reference (`=A1`) when the target should shift with the formula, and an absolute reference (`=$A$1`) when it must stay fixed on a single parameter cell.
1. Build a multi-column calculation (sales → cost → profit → margin → tax → running total) that copies down correctly in a single fill operation.
1. Audit an existing worksheet for reference errors — formulas that point at the wrong parameter cell after copying — and correct them.
1. Use `FORMULATEXT` and `Ctrl+`` to display formulas rather than values when reviewing a model.

## Formatting and layout conventions

1. Apply the standard number formats — currency, percentage, comma, decimal places — appropriate to each type of value.
1. Use borders to signal meaning: a single top border and double bottom border on the most important totals row.
1. Apply the alignment conventions for each data type (numbers right, text left, titles merged and centered).
1. Use Merge & Center, background fill, font size, and bold to establish a visual hierarchy, and use color consistently to convey meaning rather than decoration.
1. Reproduce a formatted worksheet from an unformatted one to a specification.

## Model structure and design

1. Lay out data as a table, keeping each variable in a single row or column so formulas copy cleanly.
1. Use one consistent formula across an entire row or column rather than mixing formulas within a series.
1. Compute totals with formulas — `SUM` for contiguous ranges — rather than typing results.
1. Title every worksheet with a description of its contents so the file is self-documenting.

