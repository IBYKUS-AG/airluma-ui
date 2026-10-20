import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './ibk-table';
import { IbkTable } from './ibk-table';
import type { IbkTableHeader } from '../utils/types';

const { events, args, argTypes } = getStorybookHelpers<IbkTable>('ibk-table');

const meta: Meta<IbkTable> = {
    title: 'Components/Table',
    component: 'ibk-table',
    args,
    argTypes: {
        ...argTypes,
        variant: {
            control: { type: 'select' },
            options: ['regular', 'decent'],
        },
        // `cem analyze` records these as bare array types (`IbkTableHeader[]`,
        // `any[][]`, `any[]`) without a `parsedType`, so the helpers fall back to
        // plain text controls that start empty and cannot round-trip an array.
        // Force the JSON object editor.
        headers: { control: 'object' },
        rows: { control: 'object' },
        footers: { control: 'object' },
    },
    parameters: {
        actions: {
            handles: events,
        },
    },
    render: (args) => html`
    <ibk-table
      .variant="${args.variant}"
      ?zebra="${args.zebra}"
      ?hover="${args.hover}"
      .caption="${args.caption}"
      .headers="${args.headers}"
      .rows="${args.rows}"
      .footers="${args.footers}"
    ></ibk-table>
  `,
};

export default meta;

type Story = StoryObj<IbkTable & typeof args>;

/**
 * Infrastructure Health Dashboard
 * Updated: Buttons replaced with text links/actions
 */
export const InfrastructureHealth: Story = {
    args: {
        variant: 'regular',
        zebra: true,
        hover: true,
        caption: 'Cloud Infrastructure Health - Real-time Status',
        headers: [
            { label: 'Status' },
            { label: 'Instanz-ID' },
            { label: 'Region', icon: '&#xe91c;' },
            { label: 'CPU Last', align: 'right' },
            { label: 'Latenz', align: 'right' },
            { label: 'Aktionen', align: 'center' }
        ],
        rows: [
            [
                { content: '<ibk-chip label="Online" type="success" variant="decent"></ibk-chip>' },
                'i-04f2923da',
                'eu-central-1',
                { content: '12%', align: 'right' },
                { content: '14ms', align: 'right' },
                { content: 'Details', align: 'center' }
            ],
            [
                { content: '<ibk-chip label="Warnung" type="warning" variant="decent"></ibk-chip>' },
                'i-923da4f20',
                'us-east-1',
                { content: '88%', align: 'right' },
                { content: '120ms', align: 'right' },
                { content: 'Prüfen', align: 'center' }
            ],
            [
                { content: '<ibk-chip label="Kritisch" type="alert" variant="decent"></ibk-chip>' },
                'i-23da04f29',
                'eu-west-1',
                { content: '99%', align: 'right' },
                { content: '450ms', align: 'right' },
                { content: 'Neustart', align: 'center' }
            ],
            [
                { content: '<ibk-chip label="Offline" type="default" variant="decent"></ibk-chip>' },
                'i-a4f20923d',
                'ap-southeast-1',
                { content: '0%', align: 'right' },
                { content: '-', align: 'right' },
                { content: 'Aktivieren', align: 'center' }
            ]
        ],
        footers: [
            'Gesamt: 4 Instanzen',
            '',
            '',
            { content: 'Ø Last: 49%', align: 'right' },
            '',
            ''
        ]
    },
};

/**
 * Database Schema Review
 */
export const SchemaReview: Story = {
    args: {
        variant: 'decent',
        zebra: false,
        hover: true,
        caption: 'Postgres - users_metadata Table Schema',
        headers: [
            { label: 'Feldname' },
            { label: 'Typ' },
            { label: 'Nullable' },
            { label: 'Standardwert' }
        ],
        rows: [
            ['uuid', 'UUID', { content: 'NEIN', class: 'ibkAlert' }, 'gen_random_uuid()'],
            ['user_id', 'INTEGER', { content: 'NEIN', class: 'ibkAlert' }, '-'],
            ['settings', 'JSONB', 'JA', '{}'],
            ['last_login', 'TIMESTAMP', 'JA', 'CURRENT_TIMESTAMP'],
            ['is_active', 'BOOLEAN', { content: 'NEIN', class: 'ibkAlert' }, 'WAHR']
        ]
    },
};
