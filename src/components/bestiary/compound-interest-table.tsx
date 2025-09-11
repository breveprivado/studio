import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

const interestData = [
    { level: 1, percentage: '1%', rawGain: '0,86', totalGain: '0,86', gainPerStep: '0,86', gainInCOP: '3.440' },
    { level: 2, percentage: '1,86%', rawGain: '1,5996', totalGain: '2,72', gainPerStep: '2,4596', gainInCOP: '9.838' },
    { level: 3, percentage: '3,4596%', rawGain: '2,975256', totalGain: '5,0592', gainPerStep: '4,574856', gainInCOP: '18.299' },
    { level: 4, percentage: '6,434856%', rawGain: '5,53397616', totalGain: '9,410112', gainPerStep: '8,50923216', gainInCOP: '34.037' },
    { level: 5, percentage: '11,96883216%', rawGain: '10,29319566', totalGain: '17,50280832', gainPerStep: '15,82717182', gainInCOP: '63.309' },
    { level: 6, percentage: '22,26202782%', rawGain: '19,14534392', totalGain: '32,55522348', gainPerStep: '29,43853958', gainInCOP: '117.754' },
    { level: 7, percentage: '41,40737174%', rawGain: '35,6103397', totalGain: '60,55271566', gainPerStep: '54,75568362', gainInCOP: '219.023' },
    { level: 8, percentage: '77,01771144%', rawGain: '66,23523184', totalGain: '112,6280511', gainPerStep: '101,8455715', gainInCOP: '407.382' },
    { level: 9, percentage: '143,2529433%', rawGain: '123,1975312', totalGain: '209,4881751', gainPerStep: '189,4327631', gainInCOP: '757.731' },
    { level: 10, percentage: '266,4504745%', rawGain: '229,1474081', totalGain: '389,6480057', gainPerStep: '352,3449393', gainInCOP: '1.409.380' },
    { level: 11, percentage: '495,5978826%', rawGain: '426,214179', totalGain: '724,7452906', gainPerStep: '655,3615871', gainInCOP: '2.621.446' },
    { level: 12, percentage: '921,8120615%', rawGain: '792,7583729', totalGain: '1348,026241', gainPerStep: '1218,972552', gainInCOP: '4.875.890' },
    { level: 13, percentage: '1714,570434%', rawGain: '1474,530574', totalGain: '2507,328807', gainPerStep: '2267,288947', gainInCOP: '9.069.156' },
    { level: 14, percentage: '3189,101008%', rawGain: '2742,626867', totalGain: '4663,631582', gainPerStep: '4217,157441', gainInCOP: '16.868.630' },
    { level: 15, percentage: '5931,727875%', rawGain: '5101,285973', totalGain: '8674,354742', gainPerStep: '7843,91284', gainInCOP: '31.375.651' },
    { level: 16, percentage: '11033,01385%', rawGain: '9488,391909', totalGain: '16134,29982', gainPerStep: '14589,67788', gainInCOP: '58.358.712' },
    { level: 17, percentage: '20521,40576%', rawGain: '17648,40895', totalGain: '30009,79767', gainPerStep: '27136,80086', gainInCOP: '108.547.203' },
];

const CompoundInterestTable: React.FC = () => {
    return (
        <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Total bestias</TableHead>
                                <TableHead className="text-center">%</TableHead>
                                <TableHead className="text-center">Ganancia cruda</TableHead>
                                <TableHead className="text-center">Ganancia total</TableHead>
                                <TableHead className="text-center">GANANCIA POR ESCALERA</TableHead>
                                <TableHead className="text-center">GANANCIA EN COP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interestData.map((row) => (
                                <TableRow key={row.level} className={row.level <= 6 ? 'bg-purple-100 dark:bg-purple-900/30' : ''}>
                                    <TableCell className="text-center font-medium">{row.level}</TableCell>
                                    <TableCell className="text-center">{row.percentage}</TableCell>
                                    <TableCell className="text-center">{row.rawGain}</TableCell>
                                    <TableCell className="text-center">{row.totalGain}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 11 ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-blue-200 dark:bg-blue-800/50'}`}>$ {row.gainPerStep}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 8 ? 'bg-yellow-200 dark:bg-yellow-700/40' : 'bg-orange-300 dark:bg-orange-700/50'}`}>$ {row.gainInCOP}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default CompoundInterestTable;
