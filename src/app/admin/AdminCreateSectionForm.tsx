import React, { ReactElement, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

import { DEFAULT_LEVELS } from './iAdmin';

export interface iNewSection {
	code: string;
	title: string;
	year: string;
	term: string;
	opens: string;
	closes: string;
	levels: string;
}

interface AdminCreateSectionFormPropsType {
	onCreate: (section: iNewSection) => Promise<boolean>;
}


// Sensible starting point: this year, blank dates, and the '?' levels sentinel.
function blank_section(): iNewSection {
	return {
		code: '',
		title: '',
		year: String(new Date().getFullYear()),
		term: '',
		opens: '',
		closes: '',
		levels: DEFAULT_LEVELS,
	};
}


/**
	Create a section.

	levels is pre-filled with '?' rather than defaulted silently on the server,
	so the admin can see the value and change it. '?' expands to
	DEFAULT_TUTORIAL_LEVEL_LIST in MyProgress.get_list(), and it composes:
	'?,extra_level' means the defaults plus one more.
*/
export default function AdminCreateSectionForm(props: AdminCreateSectionFormPropsType): ReactElement {
	const [section, setSection] = useState<iNewSection>(blank_section());
	const [isSaving, setIsSaving] = useState(false);

	const set_field = (field: keyof iNewSection, value: string): void => {
		setSection(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		setIsSaving(true);
		const ok = await props.onCreate(section);
		setIsSaving(false);

		if (ok) setSection(blank_section());
	};

	return (
		<Card className='mb-4'>
			<Card.Body>
				<Card.Title>Create a section</Card.Title>
				<Form onSubmit={handleSubmit}>
					<Row>
						<Col md={3}>
							<Form.Group className='mb-2' controlId='section_code'>
								<Form.Label>Code</Form.Label>
								<Form.Control
									type='text'
									value={section.code}
									maxLength={45}
									placeholder='acct301'
									onChange={e => set_field('code', e.target.value)}
									required
								/>
								<Form.Text className='text-muted'>
									Students use this as the join code. Letters, numbers, - and _ only.
								</Form.Text>
							</Form.Group>
						</Col>
						<Col md={5}>
							<Form.Group className='mb-2' controlId='section_title'>
								<Form.Label>Title</Form.Label>
								<Form.Control
									type='text'
									value={section.title}
									maxLength={115}
									placeholder='Accounting Information Systems'
									onChange={e => set_field('title', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={2}>
							<Form.Group className='mb-2' controlId='section_year'>
								<Form.Label>Year</Form.Label>
								<Form.Control
									type='number'
									min={2000}
									max={2100}
									value={section.year}
									onChange={e => set_field('year', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={2}>
							<Form.Group className='mb-2' controlId='section_term'>
								<Form.Label>Term</Form.Label>
								<Form.Control
									type='text'
									value={section.term}
									maxLength={45}
									placeholder='Fall'
									onChange={e => set_field('term', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col md={3}>
							<Form.Group className='mb-2' controlId='section_opens'>
								<Form.Label>Opens</Form.Label>
								<Form.Control
									type='date'
									value={section.opens}
									onChange={e => set_field('opens', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={3}>
							<Form.Group className='mb-2' controlId='section_closes'>
								<Form.Label>Closes</Form.Label>
								<Form.Control
									type='date'
									value={section.closes}
									onChange={e => set_field('closes', e.target.value)}
									required
								/>
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group className='mb-2' controlId='section_levels'>
								<Form.Label>Levels</Form.Label>
								<Form.Control
									type='text'
									value={section.levels}
									onChange={e => set_field('levels', e.target.value)}
								/>
								<Form.Text className='text-muted'>
									<code>?</code> means the default tutorial list. Or enter
									comma-separated level codes. <code>?,extra_level</code> means
									the defaults plus one more.
								</Form.Text>
							</Form.Group>
						</Col>
						<Col md={2} className='d-flex align-items-start'>
							<Form.Group className='mb-2' style={{ marginTop: 32 }}>
								<Button type='submit' variant='primary' disabled={isSaving}>
									{isSaving ? 'Creating...' : 'Create section'}
								</Button>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</Card.Body>
		</Card>
	);
}
