import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerSmall } from '@/components/shared/DrawerSmall';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/lib/toast-helpers';

interface CampaignSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | null;
  campaignName: string | null;
  onSuccess?: () => void;
}

const CAMPAIGN_OBJECTIVES = [
  'Awareness',
  'Traffic',
  'Engagement',
  'Leads',
  'Sales',
  'App Promotion',
];

export function CampaignSettingsDrawer({
  open,
  onClose,
  campaignId,
  campaignName,
  onSuccess
}: CampaignSettingsDrawerProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('Active');
  const [objective, setObjective] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && campaignId && user) {
      loadCampaignSettings();
    }
  }, [open, campaignId, user]);

  const loadCampaignSettings = async () => {
    if (!campaignId || !user) return;

    const { data, error } = await supabase
      .from('campaigns')
      .select('status, objective, start_date, end_date, daily_budget, updated_at')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      showError('Failed to load campaign settings');
      return;
    }

    if (data) {
      setStatus(data.status || 'Active');
      setObjective(data.objective || '');
      setStartDate(data.start_date ? new Date(data.start_date) : undefined);
      setEndDate(data.end_date ? new Date(data.end_date) : undefined);
      setDailyBudget(data.daily_budget ? String(data.daily_budget) : '');
      setLastUpdated(data.updated_at ? new Date(data.updated_at) : null);
    }
  };

  const handleSave = async () => {
    if (!campaignId || !user) return;

    if (!status) {
      showError('Campaign status is required');
      return;
    }

    if (!objective) {
      showError('Campaign objective is required');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('campaigns')
      .update({
        status,
        objective,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
      })
      .eq('id', campaignId)
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      showError('Failed to save campaign settings');
      return;
    }

    showSuccess('Campaign settings saved successfully');
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setStatus('Active');
    setObjective('');
    setStartDate(undefined);
    setEndDate(undefined);
    setDailyBudget('');
    onClose();
  };

  return (
    <DrawerSmall
      isOpen={open}
      onClose={handleClose}
      title="Campaign Settings"
      description="Define campaign-level details used for ad exports and reporting. (These settings currently apply to Meta exports.)"
      onSave={handleSave}
      saveText="Save Settings"
      isLoading={isLoading}
      footerLeftContent={lastUpdated && `Last updated ${format(lastUpdated, 'MMM d, yyyy')}`}
    >
      <TooltipProvider>
        <div className="space-y-4">
          {/* Campaign Name - Read Only */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Campaign Name</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  This name matches your campaign in Dialed. To rename, edit it from the Campaigns list.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="bg-muted px-3 py-2 rounded-sm text-sm">
              {campaignName}
            </div>
          </div>

          {/* Campaign Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Campaign Status <span className="text-red-500">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  Set whether this campaign is Active, Paused, or Archived.
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="h-10 rounded-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Objective */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="objective" className="text-sm font-medium">
                Campaign Objective <span className="text-red-500">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  The main goal of this campaign (e.g., Awareness, Leads, Sales).
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="objective" className="h-10 rounded-sm">
                <SelectValue placeholder="Select objective" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {obj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Start Date</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  When your campaign should start running.
                </TooltipContent>
              </Tooltip>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-10 justify-start text-left font-normal rounded-sm',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">End Date</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  Defines when your campaign should stop running.
                </TooltipContent>
              </Tooltip>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-10 justify-start text-left font-normal rounded-sm',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Daily Budget */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="budget" className="text-sm font-medium">
                Daily Budget
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  The average amount you want to spend per day across all ads in this campaign.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                placeholder="0.00"
                className="pl-7 h-10 rounded-sm"
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </DrawerSmall>
  );
}
