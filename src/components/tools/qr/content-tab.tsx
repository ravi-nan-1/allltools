"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QRConfig } from "./types";
import { Globe, Type, Mail, Phone, MessageSquare, Wifi, User, MapPin } from "lucide-react";

interface ContentTabProps {
  config: QRConfig;
  setConfig: (config: QRConfig) => void;
}

const typeIcons = {
  url: Globe,
  text: Type,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  wifi: Wifi,
  vcard: User,
  location: MapPin,
};

export const ContentTab = ({ config, setConfig }: ContentTabProps) => {
  const updateContent = <K extends keyof QRConfig>(field: K, value: QRConfig[K]) => {
    setConfig({ ...config, [field]: value });
  };

  const renderContentInput = () => {
    switch (config.type) {
      case "url":
        return (
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={config.content}
              onChange={(e) => updateContent("content", e.target.value)}
            />
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter your text here..."
              value={config.content}
              onChange={(e) => updateContent("content", e.target.value)}
              rows={4}
            />
          </div>
        );
      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={config.content.split("?")[0].replace("mailto:", "")}
                onChange={(e) => updateContent("content", `mailto:${e.target.value}`)}
              />
            </div>
          </div>
        );
      case "phone":
        return (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={config.content.replace("tel:", "")}
              onChange={(e) => updateContent("content", `tel:${e.target.value}`)}
            />
          </div>
        );
      case "sms":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-number">Phone Number</Label>
              <Input
                id="sms-number"
                type="tel"
                placeholder="+1234567890"
                value={config.content.split(":")[1]?.split("?")[0] || ""}
                onChange={(e) => updateContent("content", `sms:${e.target.value}`)}
              />
            </div>
          </div>
        );
      case "wifi": {
        const wifiParts = /^WIFI:T:(.*?);S:(.*?);P:(.*?);;$/.exec(config.content) || [];
        const [, wifiType = "WPA", wifiSsid = "", wifiPassword = ""] = wifiParts;
        const updateWifi = (next: { type?: string; ssid?: string; password?: string }) => {
          const type = next.type ?? wifiType;
          const ssid = next.ssid ?? wifiSsid;
          const password = next.password ?? wifiPassword;
          updateContent("content", `WIFI:T:${type};S:${ssid};P:${password};;`);
        };
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                placeholder="MyWiFi"
                value={wifiSsid}
                onChange={(e) => updateWifi({ ssid: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                placeholder="password123"
                value={wifiPassword}
                onChange={(e) => updateWifi({ password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-type">Security Type</Label>
              <Select value={wifiType} onValueChange={(value) => updateWifi({ type: value })}>
                <SelectTrigger id="wifi-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }
      case "vcard": {
        const nameMatch = /FN:(.*)/.exec(config.content)?.[1] ?? "";
        const emailMatch = /EMAIL:(.*)/.exec(config.content)?.[1] ?? "";
        const phoneMatch = /TEL:(.*)/.exec(config.content)?.[1] ?? "";
        const updateVcard = (next: { name?: string; email?: string; phone?: string }) => {
          const name = next.name ?? nameMatch;
          const email = next.email ?? emailMatch;
          const phone = next.phone ?? phoneMatch;
          updateContent(
            "content",
            `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`
          );
        };
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vcard-name">Full Name</Label>
              <Input
                id="vcard-name"
                placeholder="John Doe"
                value={nameMatch}
                onChange={(e) => updateVcard({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                placeholder="john@example.com"
                value={emailMatch}
                onChange={(e) => updateVcard({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vcard-phone">Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneMatch}
                onChange={(e) => updateVcard({ phone: e.target.value })}
              />
            </div>
          </div>
        );
      }
      case "location": {
        const [lat = "40.7128", lng = "-74.0060"] = config.content.replace("geo:", "").split(",");
        const updateLocation = (next: { lat?: string; lng?: string }) => {
          updateContent("content", `geo:${next.lat ?? lat},${next.lng ?? lng}`);
        };
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-lat">Latitude</Label>
              <Input
                id="location-lat"
                type="number"
                step="any"
                placeholder="40.7128"
                value={lat}
                onChange={(e) => updateLocation({ lat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-lng">Longitude</Label>
              <Input
                id="location-lng"
                type="number"
                step="any"
                placeholder="-74.0060"
                value={lng}
                onChange={(e) => updateLocation({ lng: e.target.value })}
              />
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="type">QR Code Type</Label>
        <Select
          value={config.type}
          onValueChange={(value) => {
            const defaults: Record<string, string> = {
              url: "https://example.com",
              text: "",
              email: "mailto:",
              phone: "tel:",
              sms: "sms:",
              wifi: "WIFI:T:WPA;S:;P:;;",
              vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:\nTEL:\nEMAIL:\nEND:VCARD",
              location: "geo:40.7128,-74.0060",
            };
            setConfig({ ...config, type: value as QRConfig["type"], content: defaults[value] ?? "" });
          }}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(typeIcons).map(([key, Icon]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{key}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderContentInput()}

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Keep your content concise for better scanning reliability
        </p>
      </div>
    </div>
  );
};
