"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Download, Calendar, HelpCircle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Pick a date
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Subscriptions
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">More info</span>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,682</div>
            <p className="text-xs text-muted-foreground">
              +15.54% since last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">More info</span>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,226</div>
            <p className="text-xs text-muted-foreground">
              +40.2% since last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Revenue
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">More info</span>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,080</div>
            <p className="text-xs text-muted-foreground">
              +10.8% since last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">More info</span>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sale Activity - Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Showing total sales for the last 6 months
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
