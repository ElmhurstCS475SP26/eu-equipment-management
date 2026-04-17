"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Plus, Edit, Trash2, Package, Users, TrendingUp, AlertCircle, Wrench, Search, Flag, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { EditEquipmentDialog } from "@/components/EditEquipmentDialog";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { FlagEquipmentDialog } from "@/components/FlagEquipmentDialog";
import { resolveFlagAction } from "@/app/actions/flagActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateReservationStatusAction } from "@/app/actions/reservationActions";

export default function AdminDashboardClient({ initialEquipment, initialReservations }) {

  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [reservations, setReservations] = useState(initialReservations);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flaggingEquipment, setFlaggingEquipment] = useState(null);

  useEffect(() => {
    setEquipment(initialEquipment);
  }, [initialEquipment]);

  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/");
      return;
    }

    const role = user?.publicMetadata?.role;

    if (role === "admin") {
      setIsAuthorized(true);
    } else {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || !isAuthorized) {
    return <div className="p-6">Loading...</div>;
  }

  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter((e) => e.availability === "Available").length;
  const activeReservations = reservations.filter((r) => r.status === "Active").length;
  const pendingReservations = reservations.filter((r) => r.status === "Pending").length;
  const overdueEquipment = 0; // Keeping as 0 for prototype until implemented gracefully

  const mostReserved = [...equipment]
    .sort((a, b) => b.quantity - b.quantityAvailable - (a.quantity - a.quantityAvailable))
    .slice(0, 5);

  const handleAddEquipment = () => {
    toast.success("Equipment added successfully");
    setIsAddDialogOpen(false);
  };

  const handleEditEquipment = (updatedEquipment) => {
    setEquipment(equipment.map(item =>
      item.id === updatedEquipment.id ? updatedEquipment : item
    ));
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = () => {
    if (deletingEquipment) {
      setEquipment(equipment.filter(item => item.id !== deletingEquipment.id));
      toast.success("Equipment deleted successfully");
      setDeletingEquipment(null);
    }
  };

  const handleResolveFlag = async (item) => {
    if (!item.flag) return;
    try {
      const result = await resolveFlagAction(item.flag.id, item.id);
      if (result?.success) {
        toast.success(`Resolved flag for ${item.name}`);
      } else {
        toast.error("Failed to resolve flag");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleApproveReservation = async (id) => {
    setIsProcessing(true);
    const result = await updateReservationStatusAction(id, "approved");
    setIsProcessing(false);

    if (result.success) {
      setReservations(reservations.map(r =>
        r.id === id ? { ...r, status: "Active" } : r
      ));
      toast.success("Reservation approved");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to approve reservation");
    }
  };

  const handleRejectReservation = async (id) => {
    setIsProcessing(true);
    const result = await updateReservationStatusAction(id, "cancelled");
    setIsProcessing(false);

    if (result.success) {
      setReservations(reservations.map(r =>
        r.id === id ? { ...r, status: "Cancelled" } : r
      ));
      toast.success("Reservation rejected");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to reject reservation");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage equipment inventory and reservations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-gray-500 mt-1">{availableEquipment} currently available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations}</div>
            <p className="text-xs text-gray-500 mt-1">Currently checked out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueEquipment}</div>
            <p className="text-xs text-gray-500 mt-1">All returns on time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-semibold">Equipment Inventory</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search equipment..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Equipment
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Available/Total</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment
                    .filter((item) =>
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 w-max">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium whitespace-break-spaces min-w-32">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.availability === "Available"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : item.availability === "Reserved"
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                            }
                          >
                            {item.availability}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.quantityAvailable}/{item.quantity}
                        </TableCell>
                        <TableCell>{item.condition}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingEquipment(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {item.availability === "Flagged" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 border border-transparent hover:border-green-600 hover:text-green-700"
                                onClick={() => handleResolveFlag(item)}
                              >
                                Resolve
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setFlaggingEquipment(item);
                                  setFlagDialogOpen(true);
                                }}
                              >
                                <Flag className="h-4 w-4 text-gray-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <h2 className="text-xl font-semibold">Manage Reservations</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reservation ID</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.id}</TableCell>
                      <TableCell className="min-w-32">{reservation.equipmentName}</TableCell>
                      <TableCell>{reservation.studentId}</TableCell>
                      <TableCell>
                        {new Date(reservation.pickupDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.returnDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            reservation.status === "Active" || reservation.status === "Approved"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : reservation.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(reservation.status === "Pending" || reservation.status === "Unknown") && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveReservation(reservation.id)}
                              disabled={isProcessing}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectReservation(reservation.id)}
                              disabled={isProcessing}
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                        {(reservation.status === "Active" || reservation.status === "Approved") && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setIsProcessing(true);
                                const result = await updateReservationStatusAction(reservation.id, "returned");
                                setIsProcessing(false);
                                if (result.success) {
                                  setReservations(reservations.map(r => r.id === reservation.id ? { ...r, status: "Returned" } : r));
                                  toast.success("Marked as returned");
                                  router.refresh();
                                }
                              }}
                              disabled={isProcessing}
                            >
                              Mark Returned
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {editingEquipment && (
        <EditEquipmentDialog
          equipment={editingEquipment}
          open={!!editingEquipment}
          onOpenChange={(open) => !open && setEditingEquipment(null)}
          onSave={handleEditEquipment}
          onDelete={() => setDeletingEquipment(editingEquipment)}
        />
      )}

      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEquipment}
      />

      <AlertDialog open={!!deletingEquipment} onOpenChange={() => setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingEquipment?.name} from the inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment} className="bg-red-600 hover:bg-red-700">
              Delete Equipment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FlagEquipmentDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        equipment={flaggingEquipment}
      />
    </div>
  );
}
