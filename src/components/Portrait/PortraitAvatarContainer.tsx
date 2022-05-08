import { useEffect, useRef, useState } from 'react';
import Fade from 'react-bootstrap/Fade';
import Image from 'react-bootstrap/Image';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.scss';
import api from '../../utils/api';

export type PortraitAttributeStatus = {
	value: boolean;
	attribute_status_id: number;
}[];

export default function PortraitAvatar(props: {
	attributeStatus: PortraitAttributeStatus;
	playerId: number;
	socket: SocketIO;
}) {
	const [src, setSrc] = useState('#');
	const [showAvatar, setShowAvatar] = useState(false);
	const [attributeStatus, setAttributeStatus] = useState(props.attributeStatus);
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		const id = attributeStatus.find((stat) => stat.value)?.attribute_status_id || 0;
		previousStatusID.current = id;
		api
			.get(`/sheet/player/avatar/${id}`, { params: { playerID: props.playerId } })
			.then((res) => setSrc(`${res.data.link}?v=${Date.now()}`))
			.catch(() => setSrc('/avatar404.png'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		props.socket.on('playerAttributeStatusChange', (playerId, attrStatusID, value) => {
			if (playerId !== props.playerId) return;
			setAttributeStatus((status) => {
				const newAttrStatus = [...status];
				const index = newAttrStatus.findIndex(
					(stat) => stat.attribute_status_id === attrStatusID
				);
				if (index === -1) return status;

				newAttrStatus[index].value = value;

				const newStatusID =
					newAttrStatus.find((stat) => stat.value)?.attribute_status_id || 0;

				if (newStatusID !== previousStatusID.current) {
					previousStatusID.current = newStatusID;
					api
						.get(`/sheet/player/avatar/${newStatusID}`, {
							params: { playerID: props.playerId },
						})
						.then((res) => {
							setSrc((src) => {
								if (res.data.link === src.split('?')[0]) return src;
								setShowAvatar(false);
								return `${res.data.link}?v=${Date.now()}`;
							});
						})
						.catch(() => setSrc('/avatar404.png'));
				}

				return newAttrStatus;
			});
		});

		return () => {
			props.socket.off('playerAttributeStatusChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	return (
		<Fade in={showAvatar}>
			<div>
				<Image
					src={src}
					alt='Avatar'
					onError={() => setSrc('/avatar404.png')}
					onLoad={() => setShowAvatar(true)}
					className={styles.avatar}
				/>
			</div>
		</Fade>
	);
}
