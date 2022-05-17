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
import { Types } from "mongoose";

interface Props {
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
}

// TODO: handle image upload

export const CourseModal: React.FC<Props> = ({ setModal, showModal }) => {
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
    { value: Types.ObjectId; label: string }[]
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
    location: Types.ObjectId | "online" | "new";
    image?: string;
    tags: Types.ObjectId[];
  }>({
    name: "",
    description: "",
    location: "online",
    tags: [],
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
          if (user && user.provider && user.provider.address)
            return val._id === user!.provider!.address._id;
          return val._id === "online";
        })[0]
      );

      first.current = false;
    }
  }, [providerAddresses]);

  useEffect(() => {
    setFormData({
      ...formData,
      location: selectedAddress._id,
    });
  }, [selectedAddress]);

  useEffect(() => {
    const tags: Types.ObjectId[] = [];
    for (const value of selectedTags) tags.push(value.value);
    setFormData({ ...formData, tags });
  }, [selectedTags]);

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
    if (formData.location !== "new") {
      const auth = await Course.createCourse(
        formData.name,
        formData.description,
        formData.tags,
        formData.location
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
        if (user && user.provider && user.provider.address)
          setSelectedAddress({
            _id: user!.provider!.address._id,
            street1: user!.provider!.address.street1,
          });
        else
          setSelectedAddress({
            _id: "online",
            street1: "Online",
          });
        setFormData({ ...formData, name: "", description: "" });
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
      <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
        <Modal.Header>
          <h5>Create a Course</h5>
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
              value={{
                value: selectedAddress._id,
                label: selectedAddress.street1,
              }}
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
              setSelectedTags([]);
              if (user && user.provider && user.provider.address)
                setSelectedAddress({
                  _id: user!.provider!.address._id,
                  street1: user!.provider!.address.street1,
                });
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
