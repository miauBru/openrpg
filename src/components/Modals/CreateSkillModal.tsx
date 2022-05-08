import type { Specialization } from '@prisma/client';
import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormSelect from 'react-bootstrap/FormSelect';
import SheetModal from './SheetModal';

type CreateSkillModalProps = {
	onCreate: (
		name: string,
		startValue: number,
		mandatory: boolean,
		specializationID: number | null
	) => void;
	show: boolean;
	disabled?: boolean;
	onHide: () => void;
	specialization: Specialization[];
};

export default function CreateSkillModal(props: CreateSkillModalProps) {
	const [name, setName] = useState('');
	const [startValue, setStartValue] = useState('0');
	const [specializationID, setSpecializationID] = useState(0);
	const [mandatory, setMandatory] = useState(false);

	function reset() {
		setName('');
		setStartValue('0');
		setSpecializationID(props.specialization[0]?.id || 0);
		setMandatory(false);
	}

	return (
		<SheetModal
			title='Nova Perícia'
			show={props.show}
			onHide={props.onHide}
			onExited={reset}
			applyButton={{
				name: 'Criar',
				onApply: () =>
					props.onCreate(name, Number(startValue) || 0, mandatory, specializationID),
				disabled: props.disabled,
			}}>
			<Container fluid>
				<FormGroup controlId='createSkillName' className='mb-3'>
					<FormLabel>Nome</FormLabel>
					<FormControl
						className='theme-element'
						value={name}
						onChange={(ev) => setName(ev.currentTarget.value)}
					/>
				</FormGroup>
				<FormGroup controlId='createSkillSpecialization' className='mb-3'>
					<FormLabel>Especialização</FormLabel>
					<FormSelect
						value={specializationID}
						className='theme-element'
						onChange={(ev) => setSpecializationID(parseInt(ev.currentTarget.value))}>
						<option value='0'>Nenhuma</option>
						{props.specialization.map((spec) => (
							<option key={spec.id} value={spec.id}>
								{spec.name}
							</option>
						))}
					</FormSelect>
				</FormGroup>
				<FormGroup controlId='createSkillStartValue' className='mb-3'>
					<FormLabel>Valor Inicial</FormLabel>
					<FormControl
						type='number'
						className='theme-element'
						value={startValue}
						onChange={(ev) => setStartValue(ev.currentTarget.value)}
					/>
				</FormGroup>
				<FormCheck
					inline
					checked={mandatory}
					onChange={() => setMandatory((r) => !r)}
					id='createSkillMandatory'
					label='Obrigatório?'
				/>
			</Container>
		</SheetModal>
	);
}
