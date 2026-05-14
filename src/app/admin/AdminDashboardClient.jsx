"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Plus, Edit, Package, AlertCircle,
  Search, Flag, Calendar, Box, LayoutGrid, MoreVertical,
  ChevronRight, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EditEquipmentDialog } from "@/components/EditEquipmentDialog";
import { AddEquipmentDialog } from "@/components/AddEquipmentDialog";
import { AddKitDialog } from "@/components/AddKitDialog";
import { EditKitDialog } from "@/components/EditKitDialog";
import { FlagEquipmentDialog } from "@/components/FlagEquipmentDialog";
import { ReservationDetailsDialog } from "@/components/ReservationDetailsDialog";
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
import { removeFlagAction } from "@/app/actions/flagActions";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteItemAction, updateItemAction } from "@/app/actions/itemActions";
import { deleteKitAction } from "@/app/actions/kitActions";

export default function AdminDashboardClient({ initialEquipment, initialReservations, initialKits, forcedTab }) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // States
  const [equipment, setEquipment] = useState(initialEquipment || []);
  const [reservations, setReservations] = useState(initialReservations || []);
  const [kits, setKits] = useState(initialKits || []);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isKitDialogOpen, setIsKitDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingKit, setEditingKit] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(null);
  const [deletingKit, setDeletingKit] = useState(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flaggingEquipment, setFlaggingEquipment] = useState(null);
  const [flaggingType, setFlaggingType] = useState("item");
  const [viewingReservation, setViewingReservation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // INVENTORY FILTERS
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // KITS FILTERS
  const [kitSearch, setKitSearch] = useState("");
  const [selectedKitStatuses, setSelectedKitStatuses] = useState([]);

  // RESERVATIONS FILTERS
  const [resSearch, setResSearch] = useState("");
  const [selectedResStatuses, setSelectedResStatuses] = useState([]);
  const [resDateFilter, setResDateFilter] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/"); return; }
    if (user?.publicMetadata?.role === "admin") setIsAuthorized(true);
    else router.push("/");
  }, [isLoaded, isSignedIn, user, router]);

  // Sync state with props when router.refresh() is called
  useEffect(() => {
    setEquipment(initialEquipment || []);
  }, [initialEquipment]);

  useEffect(() => {
    setReservations(initialReservations || []);
  }, [initialReservations]);

  useEffect(() => {
    setKits(initialKits || []);
  }, [initialKits]);

  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter(e => e.availability === "Available").length;
    const reserved = equipment.filter(e => e.availability === "Checked out").length;
    const flagged = equipment.filter(e => e.status === "flagged").length + kits.filter(k => k.status === "flagged").length;
    const resOverdue = reservations.filter(r => r.status === "Open" && new Date(r.returnDate) < new Date()).length;
    const resBooked = reservations.filter(r => r.status === "Booked").length;
    return { total, available, reserved, flagged, resOverdue, resBooked };
  }, [equipment, reservations, kits]);

  const categoriesList = useMemo(() => [...new Set(equipment.map(e => e.category))], [equipment]);
  const statusOptions = ["Available", "Checked out", "Flagged"];
  const kitStatusOptions = ["Available", "Incomplete", "Checked Out", "Flagged"];
  const resStatusOptions = ["Booked", "Open", "Returned", "Cancelled"];

  const filteredInventory = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || item.brand.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 ||
        selectedStatuses.includes(item.availability) ||
        (selectedStatuses.includes("Flagged") && item.status === "flagged");
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [equipment, inventorySearch, selectedStatuses, selectedCategories]);

  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      const matchesSearch = kit.name.toLowerCase().includes(kitSearch.toLowerCase());
      const matchesStatus = selectedKitStatuses.length === 0 ||
        selectedKitStatuses.some(s => s.toLowerCase() === kit.status?.replace('_', ' ').toLowerCase()) ||
        (selectedKitStatuses.includes("Flagged") && (kit.status?.toLowerCase() === "flagged" || kit.flag));
      return matchesSearch && matchesStatus;
    });
  }, [kits, kitSearch, selectedKitStatuses]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch =
        res.equipmentName?.toLowerCase().includes(resSearch.toLowerCase()) ||
        res.studentName?.toLowerCase().includes(resSearch.toLowerCase()) ||
        res.studentId?.toLowerCase().includes(resSearch.toLowerCase());
      const matchesStatus = selectedResStatuses.length === 0 || selectedResStatuses.includes(res.status);
      const matchesDate = !resDateFilter || res.pickupDate?.includes(resDateFilter) || res.returnDate?.includes(resDateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, resSearch, selectedResStatuses, resDateFilter]);

  const handleUpdateEquipment = async (data) => {
    setIsProcessing(true);
    const result = await updateItemAction(data.id, data);
    setIsProcessing(false);
    if (result.success) {
      toast.success("Equipment updated successfully");
      router.refresh();
      setEditingEquipment(null);
    } else {
      toast.error(result.error || "Failed to update equipment");
    }
  };

  const handleDeleteEquipment = async () => {
    if (!deletingEquipment) return;
    setIsProcessing(true);
    const result = await deleteItemAction(deletingEquipment.id);
    setIsProcessing(false);
    if (result.success) {
      toast.success("Equipment deleted successfully");
      router.refresh();
      setDeletingEquipment(null);
    } else {
      toast.error(result.error || "Failed to delete equipment");
    }
  };

  const handleDeleteKit = async () => {
    if (!deletingKit) return;
    setIsProcessing(true);
    const result = await deleteKitAction(deletingKit.id);
    setIsProcessing(false);
    if (result.success) {
      toast.success("Kit deleted successfully");
      router.refresh();
      setDeletingKit(null);
    } else {
      toast.error(result.error || "Failed to delete kit");
    }
  };

  const handleRemoveFlag = async (id, type) => {
    setIsProcessing(true);
    const result = await removeFlagAction(id, type);
    setIsProcessing(false);

    if (result.success) {
      toast.success(`${type === 'kit' ? 'Kit' : 'Equipment'} unflagged`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove flag");
    }
  };

  const statusPieData = [
    { name: 'Available', value: stats.available, color: '#2563eb' },
    { name: 'Oth', value: stats.total - stats.available, color: '#e2e8f0' },
  ];

  if (!isLoaded || !isAuthorized) return <div className="p-8">Verifying...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold capitalize">
            {forcedTab === 'overview' ? 'Dashboard' : forcedTab}
          </h1>
          <p className="text-gray-500 text-sm">
            {forcedTab === 'overview' && 'Managing assets, kits, and reservations.'}
            {forcedTab === 'inventory' && 'Full inventory listing and health.'}
            {forcedTab === 'kits' && 'Bundled equipment sets.'}
            {forcedTab === 'reservations' && 'Active and historical bookings.'}
          </p>
        </div>

        {/* Conditional Buttons based on Route */}
        {forcedTab === 'inventory' && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-lg font-medium px-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        )}
        {forcedTab === 'kits' && (
          <Button onClick={() => setIsKitDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-lg font-medium px-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Kit
          </Button>
        )}
      </div>

      <div className="pt-2">
        {forcedTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500 font-medium">Available Gear</span><Package className="h-4 w-4 text-blue-500" /></div>
                  <div className="text-2xl font-bold">{stats.available}</div>
                  <p className="text-xs text-gray-400 mt-1">Out of {stats.total} total</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500 font-medium">Active Bookings</span><Calendar className="h-4 w-4 text-green-500" /></div>
                  <div className="text-2xl font-bold">{stats.resBooked}</div>
                  <p className="text-xs text-gray-400 mt-1">Confirmed reservations</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-red-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500 font-medium text-red-600">Overdue Returns</span><AlertCircle className="h-4 w-4 text-red-500" /></div>
                  <div className="text-2xl font-bold text-red-600">{stats.resOverdue}</div>
                  <p className="text-xs text-red-400 mt-1">Immediate action required</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500 font-medium">Flagged Items</span><Flag className="h-4 w-4 text-amber-500" /></div>
                  <div className="text-2xl font-bold">{equipment.filter(e => e.flag).length}</div>
                  <p className="text-xs text-gray-400 mt-1">Needs maintenance</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base font-bold">Equipment Status</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-8 py-6">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={statusPieData} innerRadius={40} outerRadius={55} paddingAngle={0} dataKey="value">{statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Available</span> <span className="font-bold">{stats.available}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Checked out</span> <span className="font-bold">{stats.reserved}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Flagged</span> <span className="font-bold">{stats.flagged}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base font-bold">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2 h-11 border-dashed" onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4" /> Add new equipment item</Button>
                  <Button variant="outline" className="w-full justify-start gap-2 h-11 border-dashed" onClick={() => setIsKitDialogOpen(true)}><LayoutGrid className="h-4 w-4" /> Create a new equipment kit</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {forcedTab === 'inventory' && (
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <aside className="w-full md:w-56 shrink-0 space-y-6 pt-1">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." className="pl-9 h-10 text-sm" value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} /></div>
              <div className="space-y-4">
                <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h4><div className="space-y-2">{statusOptions.map(opt => (<div key={opt} className="flex items-center space-x-2"><Checkbox id={`s-${opt}`} checked={selectedStatuses.includes(opt)} onCheckedChange={(checked) => setSelectedStatuses(prev => checked ? [...prev, opt] : prev.filter(x => x !== opt))} /><Label htmlFor={`s-${opt}`} className="text-sm font-medium cursor-pointer">{opt}</Label></div>))}</div></div>
                <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Category</h4><div className="space-y-2">{categoriesList.map(cat => (<div key={cat} className="flex items-center space-x-2"><Checkbox id={`c-${cat}`} checked={selectedCategories.includes(cat)} onCheckedChange={(checked) => setSelectedCategories(prev => checked ? [...prev, cat] : prev.filter(x => x !== cat))} /><Label htmlFor={`c-${cat}`} className="text-sm font-medium cursor-pointer">{cat}</Label></div>))}</div></div>
              </div>
            </aside>
            <div className="flex-1 min-w-0">
              <Card className="shadow-none border rounded-lg overflow-hidden">
                <Table><TableHeader className="bg-gray-50"><TableRow><TableHead className="w-[300px]">Equipment</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredInventory.map(item => (<TableRow key={item.id}><TableCell><div className="flex items-center gap-3"><div className="h-10 w-10 shrink-0 rounded bg-gray-100 overflow-hidden border"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="font-semibold text-sm truncate">{item.name}</p><p className="text-xs text-gray-500 truncate">{item.brand} {item.model}</p></div></div></TableCell><TableCell className="text-sm text-gray-600">{item.category}</TableCell><TableCell><Badge variant="secondary" className={`${(item.status === "available" || item.availability === "Available") && item.status !== "flagged" && !item.flag ? 'bg-green-50 text-green-700' : (item.status === "flagged" || item.availability?.toLowerCase().includes('flag') || item.flag) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} border-none font-medium`}>{(item.status === 'flagged' || item.flag) ? (item.flag?.reason || item.availability || 'Flagged') : item.availability}</Badge></TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" disabled={isProcessing}><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditingEquipment(item)} disabled={item.status === 'flagged' || item.availability?.toLowerCase().includes('flag')}>Edit</DropdownMenuItem>
                    {(item.status === 'flagged' || item.availability === 'Flagged') ? (
                      <>
                        <DropdownMenuItem onClick={() => { setFlaggingEquipment(item); setFlaggingType("item"); setFlagDialogOpen(true); }}>Edit Flag</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemoveFlag(item.id, "item")} className="text-green-600">Remove Flag</DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => { setFlaggingEquipment(item); setFlaggingType("item"); setFlagDialogOpen(true); }}>Flag</DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600" onClick={() => setDeletingEquipment(item)}>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>))}</TableBody>
                </Table>
              </Card>
            </div>
          </div>
        )}

        {forcedTab === 'kits' && (
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <aside className="w-full md:w-56 shrink-0 space-y-6 pt-1">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search kits..." className="pl-9 h-10 text-sm" value={kitSearch} onChange={(e) => setKitSearch(e.target.value)} /></div>
              <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kit Status</h4><div className="space-y-2">{kitStatusOptions.map(opt => (<div key={opt} className="flex items-center space-x-2"><Checkbox id={`ks-${opt}`} checked={selectedKitStatuses.includes(opt)} onCheckedChange={(checked) => setSelectedKitStatuses(prev => checked ? [...prev, opt] : prev.filter(x => x !== opt))} /><Label htmlFor={`ks-${opt}`} className="text-sm font-medium cursor-pointer">{opt}</Label></div>))}</div></div>
            </aside>
            <div className="flex-1 min-w-0">
              <Card className="shadow-none border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[300px]">Kit Name</TableHead>
                      <TableHead>Item Count</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKits.map(kit => (
                      <TableRow key={kit.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded bg-gray-100 overflow-hidden border">
                              {kit.image ? (
                                <img src={kit.image} alt={kit.name} className="h-full w-full object-cover" />
                              ) : kit.items?.[0]?.image ? (
                                <img src={kit.items[0].image} alt={kit.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                  <Box className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{kit.name}</p>
                              <p className="text-xs text-gray-500 truncate">{kit.externalId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 font-medium">{kit.itemCount} items</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={`${kit.status?.toLowerCase() === "available" ? 'bg-green-50 text-green-700' : (kit.status?.toLowerCase() === "flagged" || kit.flag) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} border-none font-medium capitalize whitespace-nowrap`}>
                            {(kit.status?.toLowerCase() === 'flagged' || kit.flag) ? (kit.flag?.reason || 'Flagged') : kit.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingKit(kit)} disabled={kit.status === 'flagged'}>Edit Kit</DropdownMenuItem>
                              {kit.status === 'flagged' ? (
                                <>
                                  <DropdownMenuItem onClick={() => { setFlaggingEquipment(kit); setFlaggingType("kit"); setFlagDialogOpen(true); }}>Edit Flag</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRemoveFlag(kit.id, "kit")} className="text-green-600">Remove Flag</DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem onClick={() => { setFlaggingEquipment(kit); setFlaggingType("kit"); setFlagDialogOpen(true); }}>Flag Kit</DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeletingKit(kit)}>Delete Kit</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              {filteredKits.length === 0 && <p className="text-center py-12 text-gray-500 font-medium">No kits found matching filters.</p>}
            </div>
          </div>
        )}

        {forcedTab === 'reservations' && (
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <aside className="w-full md:w-56 shrink-0 space-y-6 pt-1">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="User / Equipment..." className="pl-9 h-10 text-sm" value={resSearch} onChange={(e) => setResSearch(e.target.value)} /></div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Checked Out</Label>
                <Input type="date" className="h-9 text-xs" value={resDateFilter} onChange={(e) => setResDateFilter(e.target.value)} />
              </div>
              <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h4><div className="space-y-2">{resStatusOptions.map(opt => (<div key={opt} className="flex items-center space-x-2"><Checkbox id={`rs-${opt}`} checked={selectedResStatuses.includes(opt)} onCheckedChange={(checked) => setSelectedResStatuses(prev => checked ? [...prev, opt] : prev.filter(x => x !== opt))} /><Label htmlFor={`rs-${opt}`} className="text-sm font-medium cursor-pointer">{opt}</Label></div>))}</div></div>
            </aside>
            <div className="flex-1 min-w-0">
              <Card className="shadow-none border rounded-lg overflow-hidden">
                <Table><TableHeader className="bg-gray-50"><TableRow><TableHead>Item</TableHead><TableHead>Student</TableHead><TableHead>Dates</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredReservations.map(res => (<TableRow key={res.id}><TableCell className="font-medium text-sm">{res.equipmentName}</TableCell><TableCell><div className="text-sm font-medium">{res.studentName}</div><div className="text-xs text-gray-500">{res.studentId}</div></TableCell><TableCell className="text-sm text-gray-600 truncate">{new Date(res.pickupDate).toLocaleDateString()} - {new Date(res.returnDate).toLocaleDateString()}</TableCell><TableCell className="text-right flex items-center justify-end gap-2">
                    <Badge variant="secondary" className={`${res.status === "Returned" ? 'bg-green-50 text-green-700' : res.status === "Cancelled" ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} border-none font-medium`}>{res.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingReservation(res)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell></TableRow>))}</TableBody>
                </Table>
              </Card>
              {filteredReservations.length === 0 && <p className="text-center py-12 text-gray-500 font-medium">No reservations found.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddEquipmentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={() => router.refresh()} />
      <AddKitDialog open={isKitDialogOpen} onOpenChange={setIsKitDialogOpen} availableEquipment={equipment} onAdd={() => router.refresh()} />
      {editingKit && (
        <EditKitDialog
          open={!!editingKit}
          onOpenChange={(v) => !v && setEditingKit(null)}
          kit={editingKit}
          availableEquipment={equipment}
          onSave={() => { setEditingKit(null); router.refresh(); }}
        />
      )}
      {editingEquipment && (
        <EditEquipmentDialog equipment={editingEquipment} open={!!editingEquipment} onOpenChange={(v) => !v && setEditingEquipment(null)} onSave={handleUpdateEquipment} />
      )}
      <ReservationDetailsDialog
        reservation={viewingReservation}
        open={!!viewingReservation}
        onOpenChange={(v) => !v && setViewingReservation(null)}
        onStatusChange={() => { }}
      />
      <FlagEquipmentDialog
        open={flagDialogOpen}
        onOpenChange={setFlagDialogOpen}
        equipment={flaggingEquipment}
        type={flaggingType}
      />
      <AlertDialog open={!!deletingEquipment} onOpenChange={() => setDeletingEquipment(null)}><AlertDialogContent className="rounded-xl"><AlertDialogHeader><AlertDialogTitle>Delete Equipment?</AlertDialogTitle><AlertDialogDescription>This removes {deletingEquipment?.name} permanently.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEquipment} className="bg-red-600">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      
      <AlertDialog open={!!deletingKit} onOpenChange={() => setDeletingKit(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Kit?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the kit "{deletingKit?.name}" permanently. All items inside will be unlinked and become available individually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKit} className="bg-red-600">Delete Kit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
