// @flow
import React from 'react';

import { useTable, useFilters, useSortBy } from 'react-table';
import { Table, Button, Modal } from 'react-bootstrap';

import type { Node } from 'react';

type TablePropColumnType = {
	id: string,
	Header: string,
	width?: number, 
	accessor?: Function
};

type TablePropsType = {
	columns: Array<TablePropColumnType>,
	data: Array<any>
};




// Standard Column Filter Setup
const ColumnFilter = ({ column: { filterValue, setFilter, filter } }) => {

    return (
        <input style={{ width: '90%' }}
        value={filterValue || ''}
        onChange={e => {
            setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={`Search ${filter ? filter : ''}...`}
        />
    );
};


export function StyledReactTable(props: TablePropsType): Node {

    const m_props = React.useMemo( () => props );

    // Different type of filters.
    const filterTypes = {

        // Default text.
        text: (rows, id, filterValue) => {
        return rows.filter(row => {
            const rowValue = row.values[id];
            return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
        }
    };

    // Standard Column.
    const defaultColumn = {
        // Let's set up our default Filter UI
        Filter: ColumnFilter
    };


    const tableInstance = useTable(
        {   columns: m_props.columns, 
            defaultColumn: defaultColumn,
            filterTypes: filterTypes,
            data: m_props.data 
        },
        useFilters,
        useSortBy,
    );



    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance;



    return (
    // apply the table props
        <Table {...getTableProps()}>
            <thead>
            {// Loop over the header rows
            headerGroups.map(headerGroup => (
                // Apply the header row props
                <tr {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                    // Apply the header cell props
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} 
                        style={{ 'minWidth':  typeof (column.width) === 'number' ? column.width : 100  + 'px' }}>
                        {// Render the header
                        column.render('Header')}
                        <span>{ column.isSorted ? (column.isSortedDesc ? ' (up)' : ' (down)' ) : '' }</span>
                        {/* Render the columns filter UI */}
                        <div 
                        >{column.canFilter ? column.render("Filter") : null}</div>
                    </th>
                ))}
                </tr>
            ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
            {// Loop over the table rows
            rows.map(row => {
                // Prepare the row for display
                prepareRow(row)
                return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                    {// Loop over the rows cells
                    row.cells.map(cell => {
                    // Apply the cell props
                    return (
                        <td {...cell.getCellProps()}>
                        {// Render the cell contents
                        cell.render('Cell')}
                        </td>
                    )
                    })}
                </tr>
                )
            })}
            </tbody>
        </Table>
    );

};