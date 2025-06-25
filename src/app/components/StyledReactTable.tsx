import React, { ReactElement, useState, useMemo } from 'react';
import { Table, Form, Button } from 'react-bootstrap';

interface TablePropColumnType {
	id: string;
	Header: string;
	width: number | null; 
	accessor: string | Function | null;
}

interface TablePropsType {
	columns: Array<TablePropColumnType>;
	data: Array<any>;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
	key: string;
	direction: SortDirection;
}

export function StyledReactTable(props: TablePropsType): ReactElement {
	const [filters, setFilters] = useState<Record<string, string>>({});
	const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

	// Helper function to get cell value
	const getCellValue = (row: any, column: TablePropColumnType) => {
		if (typeof column.accessor === 'function') {
			return column.accessor(row);
		} else if (typeof column.accessor === 'string') {
			return row[column.accessor];
		} else if (column.id) {
			return row[column.id];
		}
		return '';
	};

	// Filter data based on current filters
	const filteredData = useMemo(() => {
		return props.data.filter(row => {
			return props.columns.every(column => {
				const filterValue = filters[column.id];
				if (!filterValue) return true;
				
				const cellValue = getCellValue(row, column);
				return String(cellValue)
					.toLowerCase()
					.includes(filterValue.toLowerCase());
			});
		});
	}, [props.data, props.columns, filters]);

	// Sort data based on current sort configuration
	const sortedData = useMemo(() => {
		if (!sortConfig.key || !sortConfig.direction) {
			return filteredData;
		}

		const column = props.columns.find(col => col.id === sortConfig.key);
		if (!column) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aValue = getCellValue(a, column);
			const bValue = getCellValue(b, column);

			// Handle different data types
			let comparison = 0;
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				comparison = aValue - bValue;
			} else {
				comparison = String(aValue).localeCompare(String(bValue));
			}

			return sortConfig.direction === 'asc' ? comparison : -comparison;
		});
	}, [filteredData, sortConfig, props.columns]);

	// Handle column sorting
	const handleSort = (columnId: string) => {
		let direction: SortDirection = 'asc';
		if (sortConfig.key === columnId && sortConfig.direction === 'asc') {
			direction = 'desc';
		} else if (sortConfig.key === columnId && sortConfig.direction === 'desc') {
			direction = null;
		}
		setSortConfig({ key: columnId, direction });
	};

	// Handle filter changes
	const handleFilterChange = (columnId: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[columnId]: value
		}));
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({});
	};

	// Get sort indicator
	const getSortIndicator = (columnId: string) => {
		if (sortConfig.key !== columnId) return '';
		if (sortConfig.direction === 'asc') return ' ↑';
		if (sortConfig.direction === 'desc') return ' ↓';
		return '';
	};

	return (
		<div>
			{/* Filter controls */}
			{Object.keys(filters).length > 0 && (
				<div className="mb-3">
					<Button variant="outline-secondary" size="sm" onClick={clearFilters}>
						Clear All Filters
					</Button>
				</div>
			)}

			<Table striped bordered hover responsive>
				<thead className="table-dark">
					{/* Header row */}
					<tr>
						{props.columns.map(column => (
							<th 
								key={column.id}
								style={{ 
									minWidth: typeof column.width === 'number' ? `${column.width}px` : '100px',
									cursor: 'pointer',
									userSelect: 'none'
								}}
								onClick={() => handleSort(column.id)}
							>
								<div>
									{column.Header}
									{getSortIndicator(column.id)}
								</div>
							</th>
						))}
					</tr>
					{/* Filter row */}
					<tr>
						{props.columns.map(column => (
							<th key={`filter-${column.id}`} className="bg-light">
								<Form.Control
									size="sm"
									type="text"
									placeholder={`Filter ${column.Header}...`}
									value={filters[column.id] || ''}
									onChange={(e) => handleFilterChange(column.id, e.target.value)}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sortedData.length === 0 ? (
						<tr>
							<td colSpan={props.columns.length} className="text-center text-muted">
								No data found
							</td>
						</tr>
					) : (
						sortedData.map((row, rowIndex) => (
							<tr key={rowIndex}>
								{props.columns.map(column => (
									<td key={`${rowIndex}-${column.id}`}>
										{getCellValue(row, column)}
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</Table>

			{/* Table info */}
			<div className="text-muted small">
				Showing {sortedData.length} of {props.data.length} rows
			</div>
		</div>
	);
};