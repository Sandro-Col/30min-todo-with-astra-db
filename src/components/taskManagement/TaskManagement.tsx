import { colorPositionInArray, sortTasks } from "../../utils";
import React, {
  KeyboardEvent,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { EditMode, Locale, Task } from "../../types/types";
import { addEntry } from "../../api/addEntry";
import { getAllEntries } from "../../api/getAllEntries";
import { deleteEntry } from "../../api/deleteEntry";
import { editEntry } from "../../api/editEntry";
import { FavoriteAddButton } from "./FavoriteAddButton";
import { FavoriteRemoveButton } from "./FavoriteRemoveButton";
import { CompleteButton } from "./CompleteButton";
import { EditButton } from "./EditButton";
import { RestoreButton } from "./RestoreButton";
import { DeleteButton } from "./DeleteButton";
import { CancelEditButton } from "./CancelEditButton";
import { TaskDate } from "./TaskDate";
import { TaskDescription } from "./TaskDescription";
import { TaskInput } from "./TaskInput";
import AppSettingsContext from "../../context/appSettingsContext";
import { STRINGS } from "../../strings/strings";

export function TaskManagement() {
  const { locale } = useContext(AppSettingsContext);
  const [taskName, setTaskName] = useState<string>("");
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [totalNumberOfTasks, setTotalNumberOfTasks] = useState<number>(0);
  // const [apiPagination, setApiPagination] = useState<string>("");
  const [editMode, setEditMode] = useState<EditMode>({
    id: "",
    isEditing: false,
  });

  const handleEnter = (typeEvent: KeyboardEvent) => {
    if (typeEvent.key === "Enter") {
      handleAddTask();
    }
  };

  const handleTypeTaskName = (typeEvent: SyntheticEvent<HTMLInputElement>) => {
    //  Use this for field validation
    const target = typeEvent.target as HTMLInputElement;
    setTaskName(target.value);
  };

  const handleEdit = async (id: string) => {
    setEditMode({
      id: id,
      isEditing: true,
    });
    setTaskName(
      taskList.find((e) => e.id === id)?.name ?? "N/A"
    ); /*N/A should never occur*/
  };

  const handleCancelEdit = () => {
    setEditMode({ id: "", isEditing: false });
    setTaskName("");
  };

  const findTask = (id: string) => taskList.find((e) => e.id === id);

  const handleAddTask = async () => {
    if (!taskName) return;
    if (editMode.isEditing) {
      const newTask = { ...findTask(editMode.id)! };
      newTask.name = taskName;
      newTask.lastUpdateTime = new Date().valueOf();
      newTask.tags?.push("updated");
      await editEntry(newTask);
      setEditMode({
        id: "",
        isEditing: false,
      });
    } else {
      await addEntry(taskName);
    }
    setTaskName("");
    const newList = await getAllEntries();
    if (newList && newList.tasks) {
      setTaskList(newList.tasks);
      // setApiPagination(newList.pagination);
      // setTotalNumberOfTasks(newList.rowCount); //DOES NOT WORK
      setTotalNumberOfTasks(newList.tasks.length); //TEMPORARY SOLUTION - FLAKY SINCE ITS WITHOUT PAGINATION
    }
  };

  const handleDelete = async (id: string) => {
    setEditMode({ id: "", isEditing: false });
    setTaskName("");
    await deleteEntry(id);
    const newList = await getAllEntries();
    setTaskList(newList.tasks);
    // setApiPagination(newList.pagination);
    setTotalNumberOfTasks(newList.tasks.length); //TEMPORARY SOLUTION - FLAKY SINCE ITS WITHOUT PAGINATION
  };

  const handleFavorite = async (id: string) => {
    const newTask = { ...findTask(id)! };
    newTask.tags = newTask.tags.find((tag) => tag === "favorite")
      ? newTask.tags.filter((tag) => tag !== "favorite")
      : newTask.tags.concat("favorite");
    await editEntry(newTask);
    const newList = await getAllEntries();
    setTaskList(newList.tasks);
  };

  const handleComplete = async (id: string) => {
    const newTask = { ...findTask(id)! };
    newTask.isDone = true;
    newTask.lastUpdateTime = new Date().valueOf();
    await editEntry(newTask);
    const newList = await getAllEntries();
    setTaskList(newList.tasks);
  };

  const handleRestore = async (id: string) => {
    const newTask = { ...findTask(id)! };
    newTask.isDone = false;
    newTask.lastUpdateTime = new Date().valueOf();
    await editEntry(newTask);
    setEditMode({ id: "", isEditing: false });
    setTaskName("");
    const newList = await getAllEntries();
    setTaskList(newList.tasks);
  };

  useEffect(() => {
    getAllEntries().then((newList) => {
      if (newList && newList.tasks) {
        setTaskList(newList.tasks);
        setTotalNumberOfTasks(newList.tasks.length); //TEMPORARY SOLUTION - FLAKY SINCE ITS WITHOUT PAGINATION
        // setApiPagination(newList.pagination);
      }
    });
  }, []);

  function generateEntryStyles(entry: Task, i: number) {
    const common = { width: "100%", margin: "0 10px 8px" };
    return entry.isDone
      ? { ...common, backgroundColor: "lightgray" }
      : {
          ...common,
          backgroundColor: colorPositionInArray(i),
        };
  }

  function generateControlsStyles(entry: Task, i: number) {
    return (editMode.isEditing && editMode.id === entry.id) ||
      (!editMode.isEditing && !entry.isDone)
      ? {
          height: "65px",
          padding: "1em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
        }
      : {
          display: "none",
        };
  }

  return (
    <section style={{ width: "100vw", maxWidth: "100%" }}>
      {editMode.isEditing ? (
        /*TODO: MOVE TO NEW ROUTED zCOMPONENT*/
        <>
          <h1>Edit mode: ON</h1>
          <h2>{editMode.id}</h2>
          <h3>
            {taskList.find((entry) => entry.id === editMode.id)?.name ??
              "Nao encontrado"}
          </h3>
        </>
      ) : (
        <TaskInput
          handleAddTask={handleAddTask}
          handleTypeTaskName={handleTypeTaskName}
          handleEnter={handleEnter}
          taskName={taskName}
        />
      )}
      {totalNumberOfTasks ? (
        <h2
          style={{
            padding: "1em 1em 0",
            margin: "2rem 0 1rem",
          }}
        >
          <i className="fas fa-tasks" />
          &nbsp;
          {`${
            locale === Locale.BR ? STRINGS.LIST_TITLE.pt : STRINGS.LIST_TITLE.en
          } (${totalNumberOfTasks})`}
        </h2>
      ) : (
        <h2>
          {locale === Locale.BR ? STRINGS.EMPTY_LIST.pt : STRINGS.EMPTY_LIST.en}
        </h2>
      )}
      <section id="tasks" style={{ display: "flex", flexWrap: "wrap" }}>
        {taskList &&
          taskList.sort(sortTasks).map((entry, i) => {
            return (
              <article key={entry.id} style={generateEntryStyles(entry, i)}>
                <div
                  style={{
                    maxWidth: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {editMode.isEditing && editMode.id === entry.id ? (
                    <input
                      type="text"
                      id="taskDescription"
                      name="taskDescription"
                      placeholder="Digite aqui seu lembrete"
                      onChange={handleTypeTaskName}
                      onKeyPress={handleEnter}
                      value={taskName}
                      style={{
                        flex: 1,
                        padding: "0.5em",
                      }}
                    />
                  ) : (
                    <TaskDescription {...entry} />
                  )}
                </div>
                <div key={entry.id} style={generateControlsStyles(entry, i)}>
                  {!entry.isDone && <TaskDate input={entry} />}

                  {/*FAVORITE*/}
                  {!editMode.isEditing &&
                    !entry.isDone &&
                    (entry.tags.includes("favorite") ? (
                      <FavoriteRemoveButton
                        handleFavorite={handleFavorite}
                        entry={entry}
                        editMode={editMode}
                      />
                    ) : (
                      <FavoriteAddButton
                        handleFavorite={handleFavorite}
                        entry={entry}
                        editMode={editMode}
                      />
                    ))}
                  {!editMode.isEditing && !entry.isDone && (
                    <CompleteButton
                      handleComplete={handleComplete}
                      entry={entry}
                      editMode={editMode}
                    />
                  )}

                  {/*EDIT CONTROLS*/}
                  {editMode.isEditing && entry.id === editMode.id && (
                    <>
                      <RestoreButton
                        entry={entry}
                        handleRestore={handleRestore}
                        editMode={editMode}
                      />
                      <DeleteButton
                        editMode={editMode}
                        entry={entry}
                        handleDelete={handleDelete}
                      />
                      <CancelEditButton
                        editMode={editMode}
                        handleCancelEdit={handleCancelEdit}
                        entry={entry}
                      />
                    </>
                  )}
                  <EditButton
                    editMode={editMode}
                    handleEdit={handleEdit}
                    entry={entry}
                  />
                </div>
              </article>
            );
          })}
      </section>
    </section>
  );
}
