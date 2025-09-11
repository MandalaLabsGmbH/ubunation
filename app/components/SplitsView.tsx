'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '@/app/hooks/useTranslation';

// Data for the donut chart.

export default function SplitsView() {
  const { translate } = useTranslation();
  const data = [
    { name: translate("splitsView-charityLabel-1"), value: 80, fill: '#3b82f6' }, // Blue
    { name: translate("splitsView-ubunationLabel-1"), value: 20, fill: '#ec4899' }, // Pink
  ];

  return (
    <Card className="bg-card shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{translate("splitsView-title-1")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Donut Chart */}
        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Description */}
        <div className="space-y-6">
          <div className="space-y-4">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="font-semibold">{entry.name}:</span>
                <span className="ml-2 text-muted-foreground">{entry.value}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic">
            {translate("splitsView-disclaimer-1")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
