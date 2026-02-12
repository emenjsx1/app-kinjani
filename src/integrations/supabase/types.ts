export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notification_settings: {
        Row: {
          browser_push_enabled: boolean | null
          created_at: string
          id: string
          notify_new_users: boolean | null
          notify_whatsapp_connected: boolean | null
          push_subscription: Json | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          browser_push_enabled?: boolean | null
          created_at?: string
          id?: string
          notify_new_users?: boolean | null
          notify_whatsapp_connected?: boolean | null
          push_subscription?: Json | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          browser_push_enabled?: boolean | null
          created_at?: string
          id?: string
          notify_new_users?: boolean | null
          notify_whatsapp_connected?: boolean | null
          push_subscription?: Json | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      admin_notifications_log: {
        Row: {
          created_at: string
          dados: Json | null
          enviado_push: boolean | null
          enviado_whatsapp: boolean | null
          id: string
          mensagem: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          dados?: Json | null
          enviado_push?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          dados?: Json | null
          enviado_push?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem?: string | null
          tipo?: string
        }
        Relationships: []
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number | null
          conversion_amount: number | null
          converted_at: string | null
          created_at: string
          id: string
          referred_user_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number | null
          conversion_amount?: number | null
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number | null
          conversion_amount?: number | null
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          commission_rate: number
          created_at: string
          id: string
          motivacao: string | null
          nome_completo: string | null
          paid_balance: number
          pending_balance: number
          referral_code: string
          status: string
          telefone: string | null
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          motivacao?: string | null
          nome_completo?: string | null
          paid_balance?: number
          pending_balance?: number
          referral_code: string
          status?: string
          telefone?: string | null
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          motivacao?: string | null
          nome_completo?: string | null
          paid_balance?: number
          pending_balance?: number
          referral_code?: string
          status?: string
          telefone?: string | null
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          channel: string
          client_id: string | null
          created_at: string
          id: string
          instance_id: string | null
          messages_handled: number
          name: string
          prompt: string | null
          status: string
          type: string
          type_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          client_id?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          messages_handled?: number
          name: string
          prompt?: string | null
          status?: string
          type: string
          type_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          client_id?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          messages_handled?: number
          name?: string
          prompt?: string | null
          status?: string
          type?: string
          type_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_numbers: {
        Row: {
          created_at: string | null
          id: string
          is_global_admin: boolean | null
          phone_number: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_global_admin?: boolean | null
          phone_number: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_global_admin?: boolean | null
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      broadcast_logs: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          failed_count: number | null
          id: string
          sent_count: number | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          sent_count?: number | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          sent_count?: number | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          tipo: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          tipo?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          tipo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          accent_color: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          monthly_value: number | null
          name: string
          phone: string | null
          plan: string | null
          primary_color: string | null
          secondary_color: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_value?: number | null
          name: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          monthly_value?: number | null
          name?: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome_banco: string
          numero_conta: string | null
          saldo: number | null
          tipo_conta: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome_banco: string
          numero_conta?: string | null
          saldo?: number | null
          tipo_conta?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome_banco?: string
          numero_conta?: string | null
          saldo?: number | null
          tipo_conta?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          action: string
          amount: number
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cupons: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string | null
          expira_em: string | null
          id: string
          max_usos: number | null
          planos_aplicaveis: string[] | null
          tipo: string
          updated_at: string
          usos_atuais: number
          valor: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          expira_em?: string | null
          id?: string
          max_usos?: number | null
          planos_aplicaveis?: string[] | null
          tipo?: string
          updated_at?: string
          usos_atuais?: number
          valor?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          expira_em?: string | null
          id?: string
          max_usos?: number | null
          planos_aplicaveis?: string[] | null
          tipo?: string
          updated_at?: string
          usos_atuais?: number
          valor?: number
        }
        Relationships: []
      }
      cupons_uso: {
        Row: {
          created_at: string
          cupom_id: string
          desconto_aplicado: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cupom_id: string
          desconto_aplicado?: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cupom_id?: string
          desconto_aplicado?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupons_uso_cupom_id_fkey"
            columns: ["cupom_id"]
            isOneToOne: false
            referencedRelation: "cupons"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          body: string
          created_at: string | null
          created_by: string
          id: string
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          target_audience: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by: string
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          target_audience?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      evolution_config: {
        Row: {
          ai_provider: string | null
          api_key: string
          api_url: string
          created_at: string | null
          id: string
          instance_name: string
          instance_token: string | null
          qr_code: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          api_key: string
          api_url?: string
          created_at?: string | null
          id?: string
          instance_name: string
          instance_token?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          api_key?: string
          api_url?: string
          created_at?: string | null
          id?: string
          instance_name?: string
          instance_token?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      global_whatsapp_config: {
        Row: {
          admin_user_id: string
          api_key: string
          api_url: string
          created_at: string
          id: string
          instance_name: string
          instance_token: string | null
          provider: string | null
          qr_code: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          api_key: string
          api_url?: string
          created_at?: string
          id?: string
          instance_name: string
          instance_token?: string | null
          provider?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          api_key?: string
          api_url?: string
          created_at?: string
          id?: string
          instance_name?: string
          instance_token?: string | null
          provider?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      manutencoes: {
        Row: {
          created_at: string
          data_manutencao: string
          descricao: string
          estabelecimento: string | null
          id: string
          km_registro: number | null
          notas: string | null
          proxima_km: number | null
          proxima_manutencao: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          data_manutencao?: string
          descricao: string
          estabelecimento?: string | null
          id?: string
          km_registro?: number | null
          notas?: string | null
          proxima_km?: number | null
          proxima_manutencao?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
          veiculo_id: string
        }
        Update: {
          created_at?: string
          data_manutencao?: string
          descricao?: string
          estabelecimento?: string | null
          id?: string
          km_registro?: number | null
          notas?: string | null
          proxima_km?: number | null
          proxima_manutencao?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_whatsapp_config: {
        Row: {
          access_token: string
          admin_user_id: string
          app_id: string | null
          app_secret: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          phone_number_id: string
          status: string | null
          updated_at: string | null
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          admin_user_id: string
          app_id?: string | null
          app_secret?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          phone_number_id: string
          status?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          admin_user_id?: string
          app_id?: string | null
          app_secret?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          phone_number_id?: string
          status?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      metas_mensais: {
        Row: {
          ano: number
          ativa: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          mes: number
          meta_valor: number | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          user_id: string
          valor_atual: number | null
        }
        Insert: {
          ano: number
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          mes: number
          meta_valor?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
          valor_atual?: number | null
        }
        Update: {
          ano?: number
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          mes?: number
          meta_valor?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
          valor_atual?: number | null
        }
        Relationships: []
      }
      movimentacoes_poupanca: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          poupanca_id: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          poupanca_id: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          poupanca_id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_poupanca_poupanca_id_fkey"
            columns: ["poupanca_id"]
            isOneToOne: false
            referencedRelation: "poupancas"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          notify_limits: boolean | null
          notify_savings: boolean | null
          notify_transactions: boolean | null
          push_enabled: boolean | null
          push_subscription: Json | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notify_limits?: boolean | null
          notify_savings?: boolean | null
          notify_transactions?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notify_limits?: boolean | null
          notify_savings?: boolean | null
          notify_transactions?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      payment_config: {
        Row: {
          api_token: string
          api_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          api_token: string
          api_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          api_token?: string
          api_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          debito_reference: string | null
          description: string | null
          id: string
          msisdn: string | null
          provider_reference: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          debito_reference?: string | null
          description?: string | null
          id?: string
          msisdn?: string | null
          provider_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          debito_reference?: string | null
          description?: string | null
          id?: string
          msisdn?: string | null
          provider_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "payment_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_wallets: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          wallet_id: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          wallet_id: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          wallet_id?: number
        }
        Relationships: []
      }
      planos: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          preco_anual: number
          preco_mensal: number
          recursos: Json | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          preco_anual?: number
          preco_mensal?: number
          recursos?: Json | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          preco_anual?: number
          preco_mensal?: number
          recursos?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      poupancas: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          data_objetivo: string | null
          frequencia_lembrete: string | null
          icone: string | null
          id: string
          lembrete_ativo: boolean | null
          meta: number
          nome: string
          saldo_atual: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          data_objetivo?: string | null
          frequencia_lembrete?: string | null
          icone?: string | null
          id?: string
          lembrete_ativo?: boolean | null
          meta?: number
          nome: string
          saldo_atual?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          data_objetivo?: string | null
          frequencia_lembrete?: string | null
          icone?: string | null
          id?: string
          lembrete_ativo?: boolean | null
          meta?: number
          nome?: string
          saldo_atual?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      precos_produtos: {
        Row: {
          created_at: string
          data_registro: string
          em_promocao: boolean | null
          estabelecimento: string
          id: string
          notas: string | null
          preco: number
          preco_unitario: number | null
          produto_id: string
          quantidade: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_registro?: string
          em_promocao?: boolean | null
          estabelecimento: string
          id?: string
          notas?: string | null
          preco: number
          preco_unitario?: number | null
          produto_id: string
          quantidade?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_registro?: string
          em_promocao?: boolean | null
          estabelecimento?: string
          id?: string
          notas?: string | null
          preco?: number
          preco_unitario?: number | null
          produto_id?: string
          quantidade?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "precos_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          foto_url: string | null
          id: string
          nome: string
          unidade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome: string
          unidade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string
          unidade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          credits_balance: number
          email: string | null
          facebook: string | null
          full_name: string | null
          id: string
          instagram: string | null
          limite_diario: number | null
          linkedin: string | null
          moeda_preferida: string | null
          nome: string | null
          notificar_gastos_altos: boolean
          notificar_limite_excedido: boolean
          onboarding_completo: boolean
          plan: string
          sarcasm_level: string
          subscription_expires_at: string | null
          subscription_status: string | null
          telefone: string | null
          trial_messages_count: number | null
          trial_messages_limit: number | null
          trial_savings_count: number | null
          trial_savings_limit: number | null
          trial_started_at: string | null
          trial_transactions_count: number | null
          trial_transactions_limit: number | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp_verificado: boolean
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          facebook?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          limite_diario?: number | null
          linkedin?: string | null
          moeda_preferida?: string | null
          nome?: string | null
          notificar_gastos_altos?: boolean
          notificar_limite_excedido?: boolean
          onboarding_completo?: boolean
          plan?: string
          sarcasm_level?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          telefone?: string | null
          trial_messages_count?: number | null
          trial_messages_limit?: number | null
          trial_savings_count?: number | null
          trial_savings_limit?: number | null
          trial_started_at?: string | null
          trial_transactions_count?: number | null
          trial_transactions_limit?: number | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp_verificado?: boolean
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          facebook?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          limite_diario?: number | null
          linkedin?: string | null
          moeda_preferida?: string | null
          nome?: string | null
          notificar_gastos_altos?: boolean
          notificar_limite_excedido?: boolean
          onboarding_completo?: boolean
          plan?: string
          sarcasm_level?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          telefone?: string | null
          trial_messages_count?: number | null
          trial_messages_limit?: number | null
          trial_savings_count?: number | null
          trial_savings_limit?: number | null
          trial_started_at?: string | null
          trial_transactions_count?: number | null
          trial_transactions_limit?: number | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp_verificado?: boolean
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          concluida: boolean | null
          concluida_em: string | null
          created_at: string | null
          data_tarefa: string
          descricao: string | null
          hora_lembrete: string | null
          id: string
          lembrete_enviado: boolean | null
          meta_id: string | null
          origem: string | null
          prioridade: string | null
          recorrencia: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          concluida?: boolean | null
          concluida_em?: string | null
          created_at?: string | null
          data_tarefa?: string
          descricao?: string | null
          hora_lembrete?: string | null
          id?: string
          lembrete_enviado?: boolean | null
          meta_id?: string | null
          origem?: string | null
          prioridade?: string | null
          recorrencia?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          concluida?: boolean | null
          concluida_em?: string | null
          created_at?: string | null
          data_tarefa?: string
          descricao?: string | null
          hora_lembrete?: string | null
          id?: string
          lembrete_enviado?: boolean | null
          meta_id?: string | null
          origem?: string | null
          prioridade?: string | null
          recorrencia?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "metas_mensais"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          banco: string | null
          categoria_id: string | null
          created_at: string | null
          data_transacao: string
          desconto: number | null
          descricao: string
          estabelecimento: string | null
          hora_transacao: string | null
          id: string
          origem: string | null
          tipo: string | null
          updated_at: string | null
          user_id: string
          valor: number
          valor_final: number
          wallet_id: string | null
        }
        Insert: {
          banco?: string | null
          categoria_id?: string | null
          created_at?: string | null
          data_transacao?: string
          desconto?: number | null
          descricao: string
          estabelecimento?: string | null
          hora_transacao?: string | null
          id?: string
          origem?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id: string
          valor: number
          valor_final: number
          wallet_id?: string | null
        }
        Update: {
          banco?: string | null
          categoria_id?: string | null
          created_at?: string | null
          data_transacao?: string
          desconto?: number | null
          descricao?: string
          estabelecimento?: string | null
          hora_transacao?: string | null
          id?: string
          origem?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
          valor_final?: number
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transacoes_categoria"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transacoes_wallet"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          ativo: boolean | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          ordem: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          ativo?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          ordem?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          ativo?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          ordem?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_encrypted: string
          created_at: string
          id: string
          is_valid: boolean | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          ativo: boolean | null
          cor: string | null
          created_at: string
          foto_url: string | null
          id: string
          km_atual: number | null
          marca: string | null
          matricula: string | null
          modelo: string | null
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          matricula?: string | null
          modelo?: string | null
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          km_atual?: number | null
          marca?: string | null
          matricula?: string | null
          modelo?: string | null
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          logo_url: string | null
          nome: string
          saldo: number | null
          saldo_inicial: number | null
          tipo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          saldo?: number | null
          saldo_inicial?: number | null
          tipo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          saldo?: number | null
          saldo_inicial?: number | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          client_id: string | null
          config: Json | null
          created_at: string
          id: string
          name: string
          published_url: string | null
          status: string
          template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          name: string
          published_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          published_url?: string | null
          status?: string
          template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          agent_id: string | null
          client_token: string | null
          connected_at: string | null
          created_at: string
          id: string
          instance_key: string | null
          instance_name: string
          is_for_client: boolean
          phone_number: string | null
          qr_code: string | null
          status: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          agent_id?: string | null
          client_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_key?: string | null
          instance_name: string
          is_for_client?: boolean
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          agent_id?: string | null
          client_token?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_key?: string | null
          instance_name?: string
          is_for_client?: boolean
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          created_at: string
          dados_temp: Json | null
          estado: string
          id: string
          telefone: string
          ultima_interacao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dados_temp?: Json | null
          estado?: string
          id?: string
          telefone: string
          ultima_interacao?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dados_temp?: Json | null
          estado?: string
          id?: string
          telefone?: string
          ultima_interacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_trial_limit: {
        Args: { limit_type: string; user_uuid: string }
        Returns: boolean
      }
      create_default_categories_for_user: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      expire_trials: { Args: never; Returns: undefined }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_trial_usage: {
        Args: { usage_type: string; user_uuid: string }
        Returns: undefined
      }
      is_trial_expired: { Args: { user_uuid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
