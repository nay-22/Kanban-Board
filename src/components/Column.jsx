import React, { useContext, useEffect, useRef, useState } from 'react'
import drag from '../assets/drag-white.png'
import { Box, Button, FormControl, FormGroup, Modal, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Tooltip, Typography } from '@mui/material';
import nextFrame from '../utils/nextFrame';
import { ArrowDropDown, ArrowDropDownCircle, Delete, DragIndicator, Edit, Settings, Tune } from '@mui/icons-material';
import KanbanContext from '../contexts/KanbanContext';
import ConfirmationModal from './modals/ConfirmationModal';
import ColumnForm from './forms/ColumnForm';
const Column = ({ id, idx, type, column, setDraggedItem, children }) => {

    const { columns, setColumns, columnOrder, setColumnOrder, items, setItems } = useContext(KanbanContext);

    const [showColumn, setShowColumn] = useState(true);
    const [showUpdateColModal, setShowUpdateColModal] = useState(false);
    const [showDeleteColModal, setShowDeleteColModal] = useState(false);
    const [newColName, setNewColName] = useState(columns.get(id));

    useEffect(() => {
        setNewColName(columns.get(id));
    }, [columns]);

    const dragRef = useRef(null);

    const handleDragStart = async (e) => {
        setDraggedItem({ id, column, type });
        const dragElement = dragRef.current.cloneNode(true);

        dragElement.style.position = 'absolute';
        dragElement.style.top = '-9999px';
        dragElement.style.width = 'fit-content';
        dragElement.style.opacity = '1';
        document.body.appendChild(dragElement);

        e.dataTransfer.setDragImage(dragElement, 0, 0);

        await nextFrame();

        setShowColumn(false);

        setTimeout(() => {
            document.body.removeChild(dragElement);
        }, 0);
    }

    const handleDragEnd = (e) => {
        setShowColumn(true);
        setDraggedItem(null);
    }

    const updateColName = (e) => {
        e.preventDefault();
        setColumns(prev => prev.set(id, newColName));
        setShowUpdateColModal(false);
    }

    const deleteColumn = () => {
        const prevColIdx = (columns.size + idx - 1) % columns.size
        const prevCol = columnOrder[prevColIdx];

        setItems(prev => {
            const updatedState = { ...prev };
            const currColItems = updatedState[id];
            delete updatedState[id];
            currColItems.map(item => {
                item.column = prevCol;
            });
            updatedState[prevCol] = [...updatedState[prevCol], ...currColItems];
            return updatedState;
        });

        setColumns(prev => {
            const map = new Map(prev);
            map.delete(id);
            return map;
        });

        setColumnOrder(prev => {
            const updatedState = [...prev];
            updatedState.splice(idx, 1);
            return updatedState;
        });

        setShowDeleteColModal(false);
    }

    return (
        <Box
            id={col}
            key={idx}
            style={{
                display: showColumn ? 'block' : 'none',
                width: '100%',
                border: '1px solid grey',
                borderRadius: '.5em',
                minHeight: '100px',
            }}
            ref={dragRef}
        >
            <Box
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 100px',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'default',
                    backgroundColor: showDeleteColModal ? 'rgb(208, 79, 79)' : 'rgb(23, 39, 55)',
                    margin: '0',
                    padding: '.5em',
                    borderRadius: '.55em .55em 0 0',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'grab',
                    }}
                    draggable
                >
                    <DragIndicator sx={{ color: 'white' }} />
                </Box>
                <Typography
                    variant='h5'
                    color='white'
                    padding={'.5em'}
                >
                    {columns.get(id)}
                </Typography>
                <SpeedDial
                    direction='left'
                    ariaLabel='Column Actions'
                    icon={<Tooltip title="Settings">
                        <Tune sx={{
                            fontSize: '30px',
                            transition: 'transform 0.3s ease-in-out',
                        }} />
                    </Tooltip>}
                    sx={{
                        mr: '1em',
                        ml: '1em',
                    }}
                >
                    <SpeedDialAction
                        sx={{
                            bgcolor: 'white',
                            boxShadow: 'none',
                            padding: '0',
                        }}
                        icon={<Edit sx={{ fontSize: '30px', color: 'orange', bgcolor: 'transparent' }} />}
                        tooltipTitle='Edit'
                        onClick={() => setShowUpdateColModal(true)}
                    />
                    <SpeedDialAction
                        sx={{
                            bgcolor: 'white',
                            boxShadow: 'none',
                            padding: '0',
                        }}
                        icon={<Delete sx={{ fontSize: '30px', color: 'red', bgcolor: 'transparent' }} />}
                        tooltipTitle='Delete'
                        onClick={() => setShowDeleteColModal(true)}
                    />
                </SpeedDial>
                <Modal
                    open={showUpdateColModal}
                    onClose={() => setShowUpdateColModal(false)}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'rgb(56, 89, 121)',
                            borderRadius: '.5em',
                            padding: '.5em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ColumnForm edit colId={id} callback={() => setShowUpdateColModal(false)} />
                    </Box>
                </Modal>
                <ConfirmationModal
                    onClose={() => setShowDeleteColModal(false)}
                    onConfirm={deleteColumn}
                    open={showDeleteColModal}
                    message='Do you want to delete this column?'
                />
            </Box>
            {children}
        </Box>
    )
}

export default Column