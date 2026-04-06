"use client";

import { FormField, FormSelectDropdown, FormInput } from "./FormFields";

interface Series {
    id: number;
    name: string;
    slug?: string;
    description?: string | null;
}

interface SeriesOrderInfo {
    existingOrders: number[];
    nextOrder: number;
}

interface SeriesFieldsProps {
    seriesList: Series[];
    seriesId: string;
    seriesOrder: string;
    seriesOrderInfo: SeriesOrderInfo | null;
    orderError: string;
    onSeriesIdChange: (value: string) => void;
    onSeriesOrderChange: (value: string) => void;
}

export function SeriesFields({
    seriesList,
    seriesId,
    seriesOrder,
    seriesOrderInfo,
    orderError,
    onSeriesIdChange,
    onSeriesOrderChange,
}: SeriesFieldsProps) {
    return (
        <div className="p-4 rounded-lg border border-(--border-color) bg-foreground/5 space-y-4">
            <h3 className="font-medium text-foreground">Series Information</h3>

            <FormField label="Select Series" required>
                <FormSelectDropdown
                    name="series_id"
                    value={seriesId}
                    onChange={onSeriesIdChange}
                    placeholder="Select a series"
                    options={seriesList.map((series) => ({
                        value: series.id.toString(),
                        label: series.name,
                    }))}
                />
            </FormField>

            <FormField 
                label="Series Order" 
                required
                hint={seriesOrderInfo ? `next: ${seriesOrderInfo.nextOrder}` : undefined}
                error={orderError}
            >
                <FormInput
                    name="series_order"
                    type="number"
                    min={1}
                    value={seriesOrder}
                    onChange={(e) => onSeriesOrderChange(e.target.value)}
                    placeholder="e.g., 1, 2, 3..."
                    hasError={!!orderError}
                    required
                />
                {seriesOrderInfo && seriesOrderInfo.existingOrders.length > 0 && (
                    <p className="mt-1 text-xs text-foreground/40">
                        Existing orders: {seriesOrderInfo.existingOrders.join(", ")}
                    </p>
                )}
            </FormField>
        </div>
    );
}
