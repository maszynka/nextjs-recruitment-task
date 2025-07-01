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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { getUsers } from "./actions/users";
import { getAddresses } from "./actions/addresses";
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
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
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
  const [addressPreview, setAddressPreview] = useState("");

  // Fetch users
  useEffect(() => {
    setUsersLoading(true);
    setUsersError(null);
    getUsers(usersPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
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
    setAddressesLoading(true);
    setAddressesError(null);
    getAddresses(selectedUser, addressesPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
        if (!res) return;
        if ("error" in res) {
          setAddressesError(res.error ?? "Unknown error");
        } else {
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
  const handleOpenAddressModal = () => setAddressModalOpen(true);
  const handleCloseAddressModal = () => setAddressModalOpen(false);
  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simple preview logic
    const { value } = e.target;
    setAddressPreview(value); // Placeholder
  };

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
                  selected={selectedUser === user.id}
                  onClick={() => {
                    setSelectedUser(user.id);
                    setAddressesPage(1);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                    {/* Context menu for Edit/Delete (mocked) */}
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
        onChange={(_, page) => setUsersPage(page)}
      />

      {selectedUser && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Addresses for User #{selectedUser}
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
                          <IconButton>
                            <MoreVertIcon />
                          </IconButton>
                          {/* Context menu for Edit/Delete */}
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
            onChange={(_, page) => setAddressesPage(page)}
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

      {/* Address Modal (mocked) */}
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
          <Typography variant="h6">Create/Edit Address</Typography>
          {/* Form fields here */}
          <TextField
            label="Street"
            name="street"
            fullWidth
            sx={{ mt: 2 }}
            onChange={handleAddressInput}
          />
          {/* ...other fields... */}
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle2">Address Preview:</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {addressPreview ||
                "<street> <building_number>\n<post_code> <city>\n<country_code>"}
            </Typography>
          </Box>
          <Button onClick={handleCloseAddressModal} sx={{ mt: 2 }} fullWidth>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
