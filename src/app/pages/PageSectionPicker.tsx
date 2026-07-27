import React, { ReactElement, useEffect, useState } from 'react';
import { ButtonToolbar, DropdownButton, Dropdown } from 'react-bootstrap';
import iPage from './iPage';
import iSection from './iSection';

type PropsType = {
	sections: iSection[];
	pages: iPage[];
	onSelectSection: (s: iSection) => void;
};

// Returns the page for a given section, or null if no page matches the section.
export function get_page_for_section(section: iSection | null, pages: iPage[]): iPage | null {
	if (section === null) return null;
	return pages.find(p => p.slug === section.code) || null;
}

// Resolves the selected section based on the preferred section and available sections/pages.
export function resolve_selected_section(sections: iSection[], pages: iPage[], preferredSection: iSection | null): iSection | null {
	if (sections.length === 0) return null;

	const preferred = preferredSection !== null
		? sections.find(s => s.idsection === preferredSection.idsection) || null
		: null;

	if (preferred !== null && get_page_for_section(preferred, pages) !== null) {
		return preferred;
	}

	return sections.find(s => get_page_for_section(s, pages) !== null) || null;
}

// Retrieves the selected section from local storage, or null if not found.
export function get_localstorage_section(): iSection | null {
	const s = window.localStorage.getItem('ExcelFunMyProgressSection');
	if(s === null) return null;
	return JSON.parse(s);
}

// Saves the selected section to local storage.
export function set_localstorage_section(section: iSection): void {
	window.localStorage.setItem('ExcelFunMyProgressSection', JSON.stringify(section));
}


export function PageListSectionPicker(props: PropsType): ReactElement {
	const [section, setSection] = useState<iSection | null>(null);

	useEffect(() => {
		const sticky_section = get_localstorage_section();
		const selected = resolve_selected_section(props.sections, props.pages, sticky_section);
		setSection(selected);
	}, [props.sections, props.pages]);

	const handleSectionChange =  (eventKey: string | null, e: React.SyntheticEvent<unknown>): void => {
		const value = eventKey == null ? '' : eventKey;
		const sections = props.sections.filter( s => s.code === value);

		if(sections.length === 0) throw new Error('Invalid value section');

		// Translate string eventKey to a section object.
		const selected_section = props.sections.find( s => s.code === value);
		if(selected_section === undefined) throw new Error('Invalid PageListSectionPicker section selected for '+value);

		// Save the current selected to localstorage. Useful for loading the page
		set_localstorage_section(sections[0]);

		setSection(selected_section);
		props.onSelectSection(selected_section);
	}
		
	// Return card.
	return <>
		<div className='card' style={{ backgroundColor: '#f5f5f5', marginBottom: 40 }}>
			<div className='card-body'>
				<div className='card-text'>
					<ButtonToolbar>
						<DropdownButton 
							onSelect={handleSectionChange}
							variant='primary' 
							size='sm'
							title= {section?.title || 'Select a section'} 
							style= {{ marginBottom: 5 }}
							key='select_code' id='select_code'>
								{ props.sections.map( (section,i) => 
									<Dropdown.Item
										key={'select_code_dropdownitem'+i} 
										eventKey={section.code}>{section.title}
									</Dropdown.Item> 
								)}
						</DropdownButton>
					</ButtonToolbar>
				</div>
			</div>
		</div>
	</>;
}

