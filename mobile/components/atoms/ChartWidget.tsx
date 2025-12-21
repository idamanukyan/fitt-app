/**
 * ChartWidget - Data Visualization Component
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import theme from '../../utils/theme';

type ChartType = 'line' | 'bar' | 'progress';

interface ChartWidgetProps {
  title: string;
  data: number[];
  labels: string[];
  type?: ChartType;
  suffix?: string;
  color?: string;
  showValues?: boolean;
}

export default function ChartWidget({
  title,
  data,
  labels,
  type = 'line',
  suffix = '',
  color = theme.colors.lightGreen,
  showValues = false,
}: ChartWidgetProps) {
  const screenWidth = Dimensions.get('window').width - 48; // Account for padding

  // Chart configuration matching HyperFit aesthetic
  const chartConfig = {
    backgroundColor: theme.colors.oliveBlack,
    backgroundGradientFrom: theme.colors.black,
    backgroundGradientTo: theme.colors.darkGreen,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(221, 238, 94, ${opacity})`, // Light Green
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`, // White with reduced opacity
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.colors.lightGreen,
      fill: theme.colors.black,
    },
    propsForBackgroundLines: {
      strokeDasharray: '4 4',
      stroke: theme.colors.darkGreen,
      strokeWidth: 1,
      strokeOpacity: 0.3,
    },
    propsForLabels: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
    },
  };

  const renderChart = () => {
    const chartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          color: (opacity = 1) => `rgba(221, 238, 94, ${opacity})`,
          strokeWidth: 2.5,
        },
      ],
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix={suffix}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars={showValues}
          />
        );

      case 'progress':
        const progressData = {
          labels: labels,
          data: data.map(value => value / 100), // Convert to 0-1 range
        };
        return (
          <ProgressChart
            data={progressData}
            width={screenWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(221, 238, 94, ${opacity})`,
            }}
            style={styles.chart}
          />
        );

      case 'line':
      default:
        return (
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix={suffix}
            chartConfig={chartConfig}
            bezier // Smooth curves for elegance
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Title Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.indicator} />
      </View>

      {/* Chart Area */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Legend/Metadata (Optional) */}
      {showValues && (
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <View style={[styles.colorDot, { backgroundColor: theme.colors.lightGreen }]} />
            <Text style={styles.metadataText}>Performance</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.oliveBlack,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.lightGreenBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.lightGreen,
    shadowColor: theme.colors.lightGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  chart: {
    marginVertical: 8,
    borderRadius: theme.borderRadius.lg,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metadataText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.darkGray,
    fontWeight: '600',
  },
});
