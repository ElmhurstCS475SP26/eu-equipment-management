"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Plus, Edit, Trash2, Package, Users, TrendingUp, AlertCircle, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { equipmentData, reservationsData } from "@/data/mockData";
import { toast } from "sonner";
import { EditEquipmentDialog } from "@/components/EditEquipmentDialog";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
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

export default function AdminDashboard() {

  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [equipment, setEquipment] = useState(equipmentData);
  const [reservations, setReservations] = useState(reservationsData);

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
  const overdueEquipment = 0; // Mock data

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

  const handleMarkMaintenance = (id) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, availability: "Maintenance" } : item
    ));
    toast.success("Equipment marked for maintenance");
  };

  const handleApproveReservation = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: "Approved" } : r
    ));
    toast.success("Reservation approved");
  };

  const handleRejectReservation = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: "Rejected" } : r
    ));
    toast.error("Reservation rejected");
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage equipment inventory and reservations</p>
      </div>

      {/* Stats Overview */}
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
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-gray-500 mt-1">+5% from last month</p>
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
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Inventory Management */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Equipment Inventory</h2>
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
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
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingEquipment(item)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkMaintenance(item.id)}
                          >
                            <Wrench className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Management */}
        <TabsContent value="reservations" className="space-y-4">
          <h2 className="text-xl font-semibold">Manage Reservations</h2>
          <Card>
            <CardContent className="p-0">
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
                      <TableCell>{reservation.equipmentName}</TableCell>
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
                            reservation.status === "Active"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : reservation.status === "Upcoming"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {reservation.status === "Upcoming" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveReservation(reservation.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectReservation(reservation.id)}
                            >
                              Deny
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

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Equipment Analytics</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Reserved Equipment</CardTitle>
                <CardDescription>Top 5 most popular items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostReserved.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <Badge variant="secondary">
                        {item.quantity - item.quantityAvailable} reserved
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Equipment utilization by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Cameras", "Lighting Equipment", "Audio Equipment", "Lenses", "Tripods and Stabilizers"].map(
                    (category) => {
                      const categoryItems = equipmentData.filter((e) => e.category === category);
                      const totalItems = categoryItems.reduce((acc, item) => acc + item.quantity, 0);
                      const reservedItems = categoryItems.reduce(
                        (acc, item) => acc + (item.quantity - item.quantityAvailable),
                        0
                      );
                      const percentage = totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 0;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-gray-600">{percentage}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Equipment Dialog */}
      {editingEquipment && (
        <EditEquipmentDialog
          equipment={editingEquipment}
          open={editingEquipment !== null}
          onOpenChange={(open) => !open && setEditingEquipment(null)}
          onSave={handleEditEquipment}
        />
      )}

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEquipment}
      />

      {/* Delete Equipment Alert Dialog */}
      <AlertDialog open={deletingEquipment !== null} onOpenChange={(open) => !open && setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{deletingEquipment?.name}" from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/*"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Package, Users, TrendingUp, AlertCircle, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { equipmentData, reservationsData } from "@/data/mockData";
import { toast } from "sonner";
import { EditEquipmentDialog } from "@/components/EditEquipmentDialog";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
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

export default function AdminDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [equipment, setEquipment] = useState(equipmentData);
  const [reservations, setReservations] = useState(reservationsData);

  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter((e) => e.availability === "Available").length;
  const activeReservations = reservations.filter((r) => r.status === "Active").length;
  const overdueEquipment = 0; // Mock data

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

  const handleMarkMaintenance = (id) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, availability: "Maintenance" } : item
    ));
    toast.success("Equipment marked for maintenance");
  };

  const handleApproveReservation = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: "Approved" } : r
    ));
    toast.success("Reservation approved");
  };

  const handleRejectReservation = (id) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: "Rejected" } : r
    ));
    toast.error("Reservation rejected");
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage equipment inventory and reservations</p>
      </div>

      {/* Stats Overview }
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
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-gray-500 mt-1">+5% from last month</p>
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
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Inventory Management }
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Equipment Inventory</h2>
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
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
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingEquipment(item)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkMaintenance(item.id)}
                          >
                            <Wrench className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Management }
        <TabsContent value="reservations" className="space-y-4">
          <h2 className="text-xl font-semibold">Manage Reservations</h2>
          <Card>
            <CardContent className="p-0">
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
                      <TableCell>{reservation.equipmentName}</TableCell>
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
                            reservation.status === "Active"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : reservation.status === "Upcoming"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {reservation.status === "Upcoming" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveReservation(reservation.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectReservation(reservation.id)}
                            >
                              Deny
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

        {/* Analytics }
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Equipment Analytics</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Reserved Equipment</CardTitle>
                <CardDescription>Top 5 most popular items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostReserved.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <Badge variant="secondary">
                        {item.quantity - item.quantityAvailable} reserved
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Equipment utilization by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Cameras", "Lighting Equipment", "Audio Equipment", "Lenses", "Tripods and Stabilizers"].map(
                    (category) => {
                      const categoryItems = equipmentData.filter((e) => e.category === category);
                      const totalItems = categoryItems.reduce((acc, item) => acc + item.quantity, 0);
                      const reservedItems = categoryItems.reduce(
                        (acc, item) => acc + (item.quantity - item.quantityAvailable),
                        0
                      );
                      const percentage = totalItems > 0 ? Math.round((reservedItems / totalItems) * 100) : 0;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-gray-600">{percentage}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Equipment Dialog }
      {editingEquipment && (
        <EditEquipmentDialog
          equipment={editingEquipment}
          open={editingEquipment !== null}
          onOpenChange={(open) => !open && setEditingEquipment(null)}
          onSave={handleEditEquipment}
        />
      )}

      {/* Add Equipment Dialog }
      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddEquipment}
      />

      {/* Delete Equipment Alert Dialog }
      <AlertDialog open={deletingEquipment !== null} onOpenChange={(open) => !open && setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{deletingEquipment?.name}" from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}*/