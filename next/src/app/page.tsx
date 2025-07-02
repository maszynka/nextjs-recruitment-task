"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  TextField,
  Pagination,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { getUsers } from "./actions/users";
import {
  getAddresses,
  createAddress,
  deleteAddress,
  updateAddress,
} from "./actions/addresses";
import { DEFAULT_PAGE_SIZE } from "./constants";
import {
  users as usersTable,
  usersAddresses as usersAddressesTable,
} from "../schema";

export default function Home() {
  // State for users
  const [users, setUsers] = useState<(typeof usersTable.$inferSelect)[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // State for selected user and addresses
  const [selectedUser, setSelectedUser] = useState<
    typeof usersTable.$inferSelect | null
  >(null);

  const [addresses, setAddresses] = useState<
    (typeof usersAddressesTable.$inferSelect)[]
  >([]);
  const [addressesTotal, setAddressesTotal] = useState(0);
  const [addressesPage, setAddressesPage] = useState(1);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // State for modals and preview
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // User context menu state
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [userMenuUser, setUserMenuUser] = useState<
    typeof usersTable.$inferSelect | null
  >(null);

  // Address context menu state
  const [addressMenuAnchorEl, setAddressMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [addressMenuAddress, setAddressMenuAddress] = useState<
    typeof usersAddressesTable.$inferSelect | null
  >(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    addressType: "HOME" as "HOME" | "INVOICE" | "POST" | "WORK",
    validFrom: new Date().toISOString().slice(0, 16), // for datetime-local input
    postCode: "",
    city: "",
    countryCode: "",
    street: "",
    buildingNumber: "",
  });
  const [addressFormError, setAddressFormError] = useState<string | null>(null);
  const [addressFormLoading, setAddressFormLoading] = useState(false);

  // Address modal mode: 'create' or 'edit'
  const [addressModalMode, setAddressModalMode] = useState<"create" | "edit">(
    "create"
  );
  // For edit, store the original PK
  const [editAddressOriginal, setEditAddressOriginal] = useState<
    null | typeof usersAddressesTable.$inferSelect
  >(null);

  // Fetch users
  useEffect(() => {
    console.log("[DEBUG] Fetching users", { usersPage, DEFAULT_PAGE_SIZE });
    setUsersLoading(true);
    setUsersError(null);
    getUsers(usersPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
        console.log("[DEBUG] getUsers result", res);
        if ("error" in res) setUsersError(res.error);
        else {
          setUsers(res.data);
          setUsersTotal(res.total);
        }
      })
      .catch((e) => setUsersError(String(e)))
      .finally(() => setUsersLoading(false));
  }, [usersPage]);

  // Fetch addresses for selected user
  useEffect(() => {
    if (!selectedUser) return;
    console.log("[DEBUG] Fetching addresses", {
      selectedUser,
      addressesPage,
      DEFAULT_PAGE_SIZE,
    });
    setAddressesLoading(true);
    setAddressesError(null);
    getAddresses(selectedUser.id, addressesPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
        console.log("[DEBUG] getAddresses result", res);
        if (!res) return;
        if ("error" in res) {
          setAddressesError(res.error ?? "Unknown error");
        } else {
          console.log("[DEBUG] getAddresses result data", res.data, res.total);
          setAddresses(res.data);
          setAddressesTotal(res.total);
        }
      })
      .catch((e) => setAddressesError(String(e)))
      .finally(() => setAddressesLoading(false));
  }, [selectedUser, addressesPage]);

  // Handlers for modals and preview
  const handleOpenUserModal = () => setUserModalOpen(true);
  const handleCloseUserModal = () => setUserModalOpen(false);
  const handleOpenAddressModal = () => {
    setAddressForm({
      addressType: "HOME",
      validFrom: new Date().toISOString().slice(0, 16),
      postCode: "",
      city: "",
      countryCode: "",
      street: "",
      buildingNumber: "",
    });
    setAddressFormError(null);
    setAddressModalMode("create");
    setEditAddressOriginal(null);
    setAddressModalOpen(true);
  };
  const handleCloseAddressModal = () => setAddressModalOpen(false);

  // Debug log for pagination state

  useEffect(() => {
    console.log("[DEBUG] Pagination State", {
      usersPage,
      addressesPage,
      usersTotal,
      addressesTotal,
      DEFAULT_PAGE_SIZE,
      usersCount: users.length,
      addressesCount: addresses.length,
    });
  }, [
    users,
    addresses,
    usersTotal,
    addressesTotal,
    DEFAULT_PAGE_SIZE,
    usersPage,
    addressesPage,
  ]);

  // User menu handlers
  const handleUserMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: typeof usersTable.$inferSelect
  ) => {
    event.stopPropagation();
    setUserMenuAnchorEl(event.currentTarget);
    setUserMenuUser(user);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
    setUserMenuUser(null);
  };
  const handleUserEdit = () => {
    console.log("Edit user", userMenuUser);
    handleUserMenuClose();
  };
  const handleUserDelete = () => {
    console.log("Delete user", userMenuUser);
    handleUserMenuClose();
  };

  // Address menu handlers
  const handleAddressMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    address: typeof usersAddressesTable.$inferSelect
  ) => {
    event.stopPropagation();
    setAddressMenuAnchorEl(event.currentTarget);
    setAddressMenuAddress(address);
  };
  const handleAddressMenuClose = () => {
    setAddressMenuAnchorEl(null);
    setAddressMenuAddress(null);
  };
  const handleAddressEdit = () => {
    if (!addressMenuAddress) return;
    setAddressForm({
      addressType: addressMenuAddress.addressType,
      validFrom: new Date(addressMenuAddress.validFrom)
        .toISOString()
        .slice(0, 16),
      postCode: addressMenuAddress.postCode,
      city: addressMenuAddress.city,
      countryCode: addressMenuAddress.countryCode,
      street: addressMenuAddress.street,
      buildingNumber: addressMenuAddress.buildingNumber,
    });
    setAddressFormError(null);
    setAddressModalMode("edit");
    setEditAddressOriginal(addressMenuAddress);
    setAddressModalOpen(true);
    handleAddressMenuClose();
  };
  const handleAddressDelete = async () => {
    if (!addressMenuAddress || !selectedUser) return handleAddressMenuClose();
    const res = await deleteAddress(
      addressMenuAddress.userId,
      addressMenuAddress.addressType,
      new Date(addressMenuAddress.validFrom)
    );
    handleAddressMenuClose();
    if (res && "error" in res) {
      setAddressesError(res.error ?? "Unknown error");
    } else {
      // Refetch addresses
      getAddresses(selectedUser.id, addressesPage, DEFAULT_PAGE_SIZE).then(
        (res) => {
          if (res && !("error" in res)) {
            setAddresses(res.data);
            setAddressesTotal(res.total);
          }
        }
      );
    }
  };

  // Address form change handler
  const handleAddressFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressFormSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  // Address form submit handler
  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setAddressFormLoading(true);
    setAddressFormError(null);
    if (addressModalMode === "create") {
      const result = await createAddress({
        userId: selectedUser.id,
        addressType: addressForm.addressType,
        validFrom: new Date(addressForm.validFrom),
        postCode: addressForm.postCode,
        city: addressForm.city,
        countryCode: addressForm.countryCode,
        street: addressForm.street,
        buildingNumber: addressForm.buildingNumber,
      });
      setAddressFormLoading(false);
      if (result && "error" in result) {
        setAddressFormError(result.error ?? "Unknown error");
      } else {
        setAddressModalOpen(false);
        setAddressesPage(1); // Go to first page to see new address
        getAddresses(selectedUser.id, 1, DEFAULT_PAGE_SIZE).then((res) => {
          if (res && !("error" in res)) {
            setAddresses(res.data);
            setAddressesTotal(res.total);
          }
        });
      }
    } else if (
      addressModalMode === "edit" &&
      editAddressOriginal &&
      selectedUser
    ) {
      try {
        const result = await updateAddress(
          editAddressOriginal.userId,
          editAddressOriginal.addressType,
          new Date(editAddressOriginal.validFrom),
          {
            postCode: addressForm.postCode,
            city: addressForm.city,
            countryCode: addressForm.countryCode,
            street: addressForm.street,
            buildingNumber: addressForm.buildingNumber,
          }
        );
        if (result && "error" in result) {
          setAddressFormError(result.error ?? "Unknown error");
        } else {
          setAddressModalOpen(false);
          // Refetch addresses
          getAddresses(selectedUser.id, addressesPage, DEFAULT_PAGE_SIZE).then(
            (res) => {
              if (res && !("error" in res)) {
                setAddresses(res.data);
                setAddressesTotal(res.total);
              }
            }
          );
        }
      } finally {
        setAddressFormLoading(false);
      }
    }
  };

  // Address preview string
  const addressPreviewString = `${addressForm.street} ${addressForm.buildingNumber}\n${addressForm.postCode} ${addressForm.city}\n${addressForm.countryCode}`;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={handleOpenUserModal}
      >
        Create User
      </Button>
      {usersLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : usersError ? (
        <Alert severity="error">{usersError}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: typeof usersTable.$inferSelect) => (
                <TableRow
                  key={user.id}
                  hover
                  selected={selectedUser?.id === user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setAddressesPage(1);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleUserMenuOpen(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        count={Math.ceil(usersTotal / DEFAULT_PAGE_SIZE)}
        sx={{ mt: 2 }}
        page={usersPage}
        onChange={(_, page) => {
          console.log("[DEBUG] Users Pagination onChange", page);
          setUsersPage(page);
        }}
      />

      {selectedUser?.id && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Addressess of #{selectedUser.id}: {selectedUser?.firstName}{" "}
            {selectedUser?.lastName}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={handleOpenAddressModal}
          >
            Create Address
          </Button>
          {addressesLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : addressesError ? (
            <Alert severity="error">{addressesError}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Street</TableCell>
                    <TableCell>Building</TableCell>
                    <TableCell>Post Code</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addresses.map(
                    (
                      address: typeof usersAddressesTable.$inferSelect,
                      idx: number
                    ) => (
                      <TableRow key={idx}>
                        <TableCell>{address.addressType}</TableCell>
                        <TableCell>{address.street}</TableCell>
                        <TableCell>{address.buildingNumber}</TableCell>
                        <TableCell>{address.postCode}</TableCell>
                        <TableCell>{address.city}</TableCell>
                        <TableCell>{address.countryCode}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleAddressMenuOpen(e, address)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Pagination
            count={Math.ceil(addressesTotal / DEFAULT_PAGE_SIZE)}
            sx={{ mt: 2 }}
            page={addressesPage}
            onChange={(_, page) => {
              console.log("[DEBUG] Addresses Pagination onChange", page);
              setAddressesPage(page);
            }}
          />
        </Box>
      )}

      {/* User Modal (mocked) */}
      <Modal open={userModalOpen} onClose={handleCloseUserModal}>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.paper",
            m: "auto",
            mt: 10,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">Create/Edit User (Mocked)</Typography>
          {/* Form fields here */}
          <Button onClick={handleCloseUserModal} sx={{ mt: 2 }} fullWidth>
            Close
          </Button>
        </Box>
      </Modal>

      {/* Address Modal (create/edit) */}
      <Modal open={addressModalOpen} onClose={handleCloseAddressModal}>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.paper",
            m: "auto",
            mt: 10,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">
            {addressModalMode === "edit" ? "Edit Address" : "Create Address"}
          </Typography>
          <form onSubmit={handleAddressFormSubmit}>
            <TextField
              select
              label="Type"
              name="addressType"
              value={addressForm.addressType}
              onChange={handleAddressFormSelectChange}
              fullWidth
              sx={{ mt: 2 }}
              disabled={addressModalMode === "edit"}
            >
              <MenuItem value="HOME">HOME</MenuItem>
              <MenuItem value="INVOICE">INVOICE</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="WORK">WORK</MenuItem>
            </TextField>
            <TextField
              label="Valid From"
              name="validFrom"
              type="datetime-local"
              value={addressForm.validFrom}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              disabled={addressModalMode === "edit"}
            />
            <TextField
              label="Street"
              name="street"
              value={addressForm.street}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Building Number"
              name="buildingNumber"
              value={addressForm.buildingNumber}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Post Code"
              name="postCode"
              value={addressForm.postCode}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="City"
              name="city"
              value={addressForm.city}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Country Code"
              name="countryCode"
              value={addressForm.countryCode}
              onChange={handleAddressFormInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="subtitle2">Address Preview:</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                {addressPreviewString}
              </Typography>
            </Box>
            {addressFormError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {addressFormError}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              fullWidth
              disabled={addressFormLoading}
            >
              {addressFormLoading
                ? "Saving..."
                : addressModalMode === "edit"
                  ? "Update"
                  : "Save"}
            </Button>
            <Button onClick={handleCloseAddressModal} sx={{ mt: 1 }} fullWidth>
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>

      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserEdit}>Edit</MenuItem>
        <MenuItem onClick={handleUserDelete}>Delete</MenuItem>
      </Menu>

      {selectedUser?.id && (
        <Menu
          anchorEl={addressMenuAnchorEl}
          open={Boolean(addressMenuAnchorEl)}
          onClose={handleAddressMenuClose}
        >
          <MenuItem onClick={handleAddressEdit}>Edit</MenuItem>
          <MenuItem onClick={handleAddressDelete}>Delete</MenuItem>
        </Menu>
      )}
    </Container>
  );
}
