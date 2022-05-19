/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

import { Tag, Address, Course } from "../../../../API";
import {
  Tag as TagType,
  Address as AddressType,
} from "../../../../@types/Models";
import { UserContext } from "../../../../context/UserState";
import AddressModal from "./Address";

type Info = { type: "course" | "session" | "live session"; id: string } | false;

interface Props {
  info: Info;
  setInfo: React.Dispatch<React.SetStateAction<Info>>;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
}

// TODO: handle image upload

export const CourseModal: React.FC<Props> = ({
  setModal,
  showModal,
  info,
  setInfo,
}) => {
  const first = useRef(true);
  const { user } = useContext(UserContext);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<
    | AddressType
    | { _id: "online"; street1: "Online" }
    | { _id: "new"; street1: "Add new address" }
  >({
    _id: "online",
    street1: "Online",
  });
  const [selectedTags, setSelectedTags] = useState<
    { value: string; label: string }[]
  >([]);

  // field state
  const [errors, setError] = useState({
    name: null,
    description: null,
    location: null,
    image: null,
    tags: null,
  });

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    image?: string;
  }>({
    name: "",
    description: "",
  });

  const [courseTags, setCourseTags] = useState<TagType[]>([]);
  const [providerAddresses, setProviderAddresses] = useState<
    (
      | AddressType
      | { _id: "online"; street1: "Online" }
      | { _id: "new"; street1: "Add new address" }
    )[]
  >([]);

  useEffect(() => {
    if (showModal && info) {
      Course.getCourse(info.id).then((resp) => {
        if (resp.success) {
          const course = resp.data.course;

          setFormData({
            ...formData,
            name: course.name,
            description: course.description,
          });

          setSelectedTags(
            course.tags.map((tag) => {
              return { value: tag._id, label: tag.value };
            })
          );

          if (course.location && typeof course.location === "object") {
            const location = course.location;
            setSelectedAddress(
              providerAddresses.filter((addr) => addr._id === location._id)[0]
            );
          } else
            setSelectedAddress({
              _id: "online",
              street1: "Online",
            });
        }
      });
    }
  }, [info, showModal]);

  useEffect(() => {
    if (user && user.provider)
      Address.getProvidersAddresses(user.provider._id).then((resp) => {
        if (resp.success)
          setProviderAddresses([
            ...resp.data.addresses,
            {
              _id: "online",
              street1: "Online",
            },
            {
              _id: "new",
              street1: "Add new address",
            },
          ]);
      });

    Tag.getCourseTags().then((resp) => {
      if (resp.success) setCourseTags(resp.data.tags);
    });
  }, [user]);

  useEffect(() => {
    if (providerAddresses.length > 0 && first.current) {
      setSelectedAddress(
        providerAddresses.filter((val) => {
          if (
            user &&
            user.provider &&
            user.provider.address &&
            typeof user.provider.address === "object"
          )
            return val._id === user!.provider!.address._id;
          return val._id === "online";
        })[0]
      );

      first.current = false;
    }
  }, [providerAddresses]);

  const onChange = (e) => {
    if (e.target.type === "checkbox")
      setFormData({ ...formData, [e.target.name]: e.target.checked });
    else setFormData({ ...formData, [e.target.name]: e.target.value });
    setError({ ...errors, [e.target.name]: null });
  };

  // allows the enter key to submit the form
  const enterSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      await onSubmit();
    }
  };

  const onSubmit = async () => {
    if (selectedAddress._id !== "new") {
      let auth;
      if (!info)
        auth = await Course.createCourse(
          formData.name,
          formData.description,
          selectedTags.map((tag) => tag.value),
          selectedAddress._id
        );
      else
        auth = await Course.updateCourse(
          info.id,
          formData.name,
          formData.description,
          selectedTags.map((tag) => tag.value),
          selectedAddress._id
        );

      if (auth.success) {
        setError({
          name: null,
          description: null,
          location: null,
          image: null,
          tags: null,
        });

        setModal(false);
        setSelectedTags([]);
        if (
          user &&
          user.provider &&
          user.provider.address &&
          typeof user.provider.address === "object"
        )
          setSelectedAddress(user.provider.address);
        else
          setSelectedAddress({
            _id: "online",
            street1: "Online",
          });
        setFormData({ ...formData, name: "", description: "" });
        if (info) setInfo(false);
      } else {
        setError(auth.error as any);
      }
    } else {
      setShowAddressModal(true);
      setModal(false);
    }
  };

  return (
    <>
      <AddressModal
        show={showAddressModal}
        setModal={setShowAddressModal}
        onSuccess={(address) => {
          setModal(true);
          setProviderAddresses([...providerAddresses, address]);
          setSelectedAddress(address);
        }}
        onCancel={() => {
          setModal(true);
        }}
      />
      <Modal
        size="lg"
        show={showModal}
        onHide={() => {
          setModal(!showModal);
          setInfo(false);
          setSelectedTags([]);
          if (
            user &&
            user.provider &&
            user.provider.address &&
            typeof user.provider.address === "object"
          )
            setSelectedAddress(user.provider.address);
          else
            setSelectedAddress({
              _id: "online",
              street1: "Online",
            });
          setFormData({ ...formData, name: "", description: "" });
        }}
      >
        <Modal.Header>
          <h5>{info ? "Edit Course" : "Create a Course"}</h5>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-4">
            <label className="form-label">Name:</label>
            <input
              className={
                errors.name ? "form-control is-invalid" : "form-control"
              }
              type="text"
              placeholder="Name"
              name="name"
              required
              value={formData.name}
              onChange={onChange}
              onKeyUp={enterSubmit}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Description:</label>
            <textarea
              className={
                errors.description ? "form-control is-invalid" : "form-control"
              }
              rows={5}
              placeholder="description"
              name="description"
              required
              value={formData.description}
              onChange={onChange}
              onKeyUp={enterSubmit}
            />
            <div className="invalid-feedback">{errors.description}</div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Location:</label>
            <Select
              options={providerAddresses.map((val) => {
                return { value: val._id, label: val.street1 };
              })}
              value={
                selectedAddress
                  ? {
                      value: selectedAddress._id,
                      label: selectedAddress.street1,
                    }
                  : undefined
              }
              onChange={({ value }: any) => {
                const address = providerAddresses.filter(
                  (addr) => addr._id === value
                )[0];
                setSelectedAddress(address);
              }}
            />
            {errors.location && (
              <div className="text-danger">{errors.location}</div>
            )}
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Tags:</label>
            <Select
              options={courseTags.map((tag) => {
                return { value: tag._id, label: tag.value };
              })}
              onChange={(arr) => {
                setSelectedTags([...arr]);
              }}
              value={selectedTags}
              isMulti
              closeMenuOnSelect={false}
            />
            {errors.location && (
              <div className="text-danger">{errors.tags}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-danger mb-4"
            type="button"
            onClick={() => {
              setModal(false);
              setInfo(false);
              setSelectedTags([]);
              if (
                user &&
                user.provider &&
                user.provider.address &&
                typeof user.provider.address === "object"
              )
                setSelectedAddress(user.provider.address);
              else
                setSelectedAddress({
                  _id: "online",
                  street1: "Online",
                });
              setFormData({ ...formData, name: "", description: "" });
            }}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary mb-4"
            type="button"
            onClick={onSubmit}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseModal;