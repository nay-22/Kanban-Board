import { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useContext } from "react";

import KanbanContext from "../contexts/KanbanContext";
import { DragActionBroadcast, DragActionType, Id } from "../types";
import { debounce } from "@mui/material";

export const useDragHandles = () => {

    const { setActiveItem, setProjects, projectId, boardId, dragChannel: broadcast } = useContext(KanbanContext);

    const handleDragStart = (e: DragStartEvent) => {
        const { current } = e.active.data;
        if (!current) return;
        const { type } = current;
        if (type === 'column') {
            setActiveItem(current.column);
        } else if (type === 'task') {
            setActiveItem(current.task);
        }
    }

    const handleDragOver = debounce((e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === 'task';
        const isOverATask = over.data.current?.type === 'task';
        const isOverAColumn = over.data.current?.type === 'column';

        let currentColumn: Id;

        if (isActiveATask && isOverATask) {
            const targetColumn = over.data.current?.task.columnId;
            currentColumn = active.data.current?.task.columnId;
            if (currentColumn === targetColumn) return;
            setProjects(prev => {
                const newState = {
                    ...prev,
                    [projectId]: {
                        ...prev[projectId],
                        boards: {
                            ...prev[projectId].boards,
                            [boardId]: {
                                ...prev[projectId].boards[boardId],
                                tasks: prev[projectId].boards[boardId].tasks.map(task =>
                                    task.id === activeId ? { ...task, columnId: targetColumn } : task
                                )
                            }
                        }
                    }
                }
                const action: DragActionBroadcast = {
                    action: DragActionType.OVER,
                    tasks: {
                        oldImage: prev[projectId].boards[boardId].tasks!,
                        newImage: newState[projectId].boards[boardId].tasks!
                    }
                }
                broadcast.postMessage(action);
                return newState;
            })
        }

        if (isActiveATask && isOverAColumn) {
            currentColumn = active.data.current?.task.columnId;
            if (currentColumn === overId) return;
            setProjects(prev => {
                const tasks = [...prev[projectId].boards[boardId].tasks];
                const activeIndex = tasks.findIndex(task => task.id === activeId);
                tasks[activeIndex].columnId = overId;
                const newTasks = arrayMove(tasks, activeIndex, activeIndex);
                const newState = {
                    ...prev,
                    [projectId]: {
                        ...prev[projectId],
                        boards: {
                            ...prev[projectId].boards,
                            [boardId]: {
                                ...prev[projectId].boards[boardId],
                                tasks: newTasks
                            }
                        }
                    }
                }
                const action: DragActionBroadcast = {
                    action: DragActionType.OVER,
                    tasks: {
                        oldImage: prev[projectId].boards[boardId].tasks!,
                        newImage: newState[projectId].boards[boardId].tasks!
                    }
                }
                broadcast.postMessage(action);
                return newState;
            });
        }
    }, 50);

    const handleDragEnd = (e: DragEndEvent) => {
        setActiveItem(null);
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === 'task';
        const isOverATask = over.data.current?.type === 'task';

        if (isActiveATask && isOverATask) {
            setProjects(prev => {
                const tasks = [...prev[projectId].boards[boardId].tasks];
                const activeIndex = tasks.findIndex(task => task.id === activeId);
                const overIndex = tasks.findIndex(task => task.id === overId);
                if (activeIndex === overIndex) return prev;
                const newTasks = arrayMove(tasks, activeIndex, overIndex);
                const newState = {
                    ...prev,
                    [projectId]: {
                        ...prev[projectId],
                        boards: {
                            ...prev[projectId].boards,
                            [boardId]: {
                                ...prev[projectId].boards[boardId],
                                tasks: newTasks
                            }
                        }
                    }
                }
                const action: DragActionBroadcast = {
                    action: DragActionType.END,
                    tasks: {
                        oldImage: prev[projectId].boards[boardId].tasks!,
                        newImage: newState[projectId].boards[boardId].tasks!
                    }
                }
                broadcast.postMessage(action);
                return newState;
            });
        }

        if (!isActiveATask) {
            setProjects(prev => {
                const columns = [...prev[projectId].boards[boardId].columns];
                const activeColumnIndex = columns.findIndex(col => col.id === activeId);
                const overColumnIndex = columns.findIndex(col => col.id === overId);
                const newColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
                const newState = {
                    ...prev,
                    [projectId]: {
                        ...prev[projectId],
                        boards: {
                            ...prev[projectId].boards,
                            [boardId]: {
                                ...prev[projectId].boards[boardId],
                                columns: newColumns
                            }
                        }
                    }
                };
                const action: DragActionBroadcast = {
                    action: DragActionType.END,
                    columns: {
                        oldImage: prev[projectId].boards[boardId].columns!,
                        newImage: newState[projectId].boards[boardId].columns!
                    }
                }
                broadcast.postMessage(action);
                return newState;
            })
        }
    }

    return { handleDragStart, handleDragOver, handleDragEnd };
}
