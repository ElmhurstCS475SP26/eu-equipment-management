"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Edit, Calendar, Clock } from "lucide-react";
import { reservationsData } from "@/data/mockData";
import { useUser } from "@clerk/nextjs";

export default function Profile() {
  const { user } = useUser();
  const userReservations = reservationsData ? reservationsData.filter(r => r.status === "Active" || r.status === "Upcoming" || r.status === "Pending") : [];

  const getUserInitials = () => {
    if (!user || (!user.fullName && !user.firstName)) return "U";
    const nameToUse = user.fullName || user.firstName || "User";
    return nameToUse.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const role = (user?.publicMetadata?.role) || 'student';

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and account information</CardDescription>
              </div>
              {/*<Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>*/}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                  {getUserInitials()}
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{user?.fullName || 'User'}</h2>
                  <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
                  <Badge className={
                    role === 'admin'
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                  }>
                    {role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.fullName || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Loading...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Your recent reservation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservationsData ? reservationsData.filter(r => r.status === "Pending").length : 0}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Active Reservations</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {reservationsData ? reservationsData.filter(r => r.status === "Active").length : 0}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Upcoming Pickups</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {reservationsData ? reservationsData.filter(r => r.status === "Upcoming").length : 0}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Total Reservations</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {reservationsData ? reservationsData.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        {role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>Your latest equipment reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userReservations.slice(0, 3).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{reservation.equipmentName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(reservation.pickupDate).toLocaleDateString()} - {new Date(reservation.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={
                      reservation.status === "Active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : reservation.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    }>
                      {reservation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
