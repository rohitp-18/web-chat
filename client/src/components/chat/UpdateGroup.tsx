"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Stack, Avatar, Box, Modal } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "@/store/axios";
import { RootState } from "@/store/store";
import { user } from "@/store/types/userType";
import { chat } from "@/store/types/chatType";

const UpdateGroupModal = ({
  group,
  open,
  setModel,
}: {
  group: chat;
  open: boolean;
  setModel: () => void;
}) => {
  const [name, setName] = useState(group.chatName);
  const [searchInp, setSearchInp] = useState("");
  const [searchValue, setSearchValue] = useState<user[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<user[]>(group.users);
  const [selectedUserId, setSelectedUserId] = useState<string[]>(
    group.users.map((uer: user) => uer._id)
  );
  const { user } = useSelector((state: RootState) => state.user);

  const findUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchInp(e.target.value);
      const { data } = await axios.get(`/user/find?search=${e.target.value}`);

      setSearchValue(data.filter((u: user) => user && u._id !== user._id));
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = () => {
    axios.put("/chats/update", {
      groupId: group._id,
      name,
      users: selectedUserId,
    });
    setModel();
  };

  const addHandler = (item: user) => {
    if (!selectedUserId.includes(item._id)) {
      setSelectedUserId([...selectedUserId, item._id]);
      setSelectedUsers([...selectedUsers, item]);
    }
  };

  const removeHandler = (item: user) => {
    setSelectedUserId(selectedUserId.filter((id) => id !== item._id));
    setSelectedUsers(selectedUsers.filter((users) => users._id !== item._id));
  };

  const leaveHandler = () => {
    if (!user) return;
    if (user._id === group.admin._id) {
      alert("Admin cant leave the group");
      return;
    }
    setSelectedUserId(selectedUserId.filter((id) => id !== user._id));
    setSelectedUsers(selectedUsers.filter((users) => users._id !== user._id));
    submitHandler();
  };

  return (
    <>
      <Modal open={open} onClose={() => setModel()}>
        <Box className=" mx-auto py-2 mt-20 border-0 outline-0 max-w-[300px] bg-white flex flex-col justify-center items-center">
          <div className="font-bold font-size-xl">Update Group</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler();
            }}
          >
            <input
              className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md mb-1 py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
              placeholder="Enter your group name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="relative pb-2 block">
              <span className="sr-only">Search</span>
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg
                  className="h-5 w-5 fill-slate-300"
                  viewBox="0 0 20 20"
                ></svg>
              </span>
              <input
                className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                placeholder="Search for anything..."
                type="text"
                name="search"
                onChange={(e) => findUser(e)}
              />
            </label>
            <div className="flex">
              <button
                type="button"
                className="flex font-white-900 p-2 float-right clear-both bg-red-300 rounded"
                onClick={() => leaveHandler()}
              >
                leave
              </button>
              <button
                type="submit"
                className="flex font-white-900 p-2 float-right clear-both bg-voilet-300 rounded"
              >
                Update
              </button>
            </div>
          </form>
          <div className="flex">
            {selectedUsers &&
              selectedUsers.map((user) => (
                <div
                  style={{ fontSize: "12px" }}
                  key={user._id}
                  onClick={() => removeHandler(user)}
                  className="p-[3px] text-white mx-1 bg-green-300 rounded"
                >
                  {user.name} X
                </div>
              ))}
          </div>
          <Stack style={{ width: "100%" }} spacing={2}>
            {searchValue.length <= 0 ? (
              searchInp.length < 1 ? (
                <div>Please Enter user names</div>
              ) : (
                <div>Users not found</div>
              )
            ) : (
              searchValue.map((user) => (
                <div
                  key={user._id}
                  className="flex hover:text-white hover:bg-blue-200 font-bold p-2 w-full justify-between"
                  //user={user}
                  onClick={() => addHandler(user)}
                >
                  <div className="flex items-center w-full">
                    <div className="">
                      <Avatar />
                    </div>
                    <div className="px-2 font-size-md">{user.name}</div>
                  </div>
                  <div className="">
                    <MoreVertIcon />
                  </div>
                </div>
              ))
            )}
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
