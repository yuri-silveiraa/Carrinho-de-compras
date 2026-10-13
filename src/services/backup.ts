import * as FileSystem from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { ShoppingList, UserProfile, BackupPayload } from '../types';
import { formatCurrency, formatWeight, calculateItemTotal } from '../utils/formatters';
import { formatDateDisplay } from '../utils/date';
import { getCategoryById } from '../constants/categories';

export function createBackupPayload(user: UserProfile, lists: ShoppingList[]): BackupPayload {
  let totalItems = 0;
  let totalValue = 0;

  for (const list of lists) {
    totalItems += list.items.length;
    for (const item of list.items) {
      totalValue += calculateItemTotal(item);
    }
  }

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
    },
    listsCount: lists.length,
    itemsCount: totalItems,
    totalValue,
    lists,
  };
}

export function formatReadableSummary(user: UserProfile, lists: ShoppingList[]): string {
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let totalItems = 0;
  let totalValue = 0;
  let totalPaid = 0;

  lists.forEach((l) => {
    l.items.forEach((i) => {
      totalItems++;
      const val = calculateItemTotal(i);
      totalValue += val;
      if (i.isPaid) totalPaid += val;
    });
  });

  let text = `🛒 BACKUP DAS LISTAS DE COMPRAS\n`;
  text += `👤 Usuário: ${user.name} (${user.email})\n`;
  text += `📅 Data de exportação: ${dateStr}\n`;
  text += `📊 Resumo geral:\n`;
  text += `   - Total de listas: ${lists.length}\n`;
  text += `   - Total de itens: ${totalItems}\n`;
  text += `   - Valor total: ${formatCurrency(totalValue)}\n`;
  text += `   - Valor já pago: ${formatCurrency(totalPaid)}\n`;
  text += `   - Valor pendente: ${formatCurrency(totalValue - totalPaid)}\n\n`;
  text += `========================================\n\n`;

  lists.forEach((list, index) => {
    let listTotal = 0;
    let listPaid = 0;
    list.items.forEach((item) => {
      const v = calculateItemTotal(item);
      listTotal += v;
      if (item.isPaid) listPaid += v;
    });

    text += `📋 LISTA ${index + 1}: ${list.name}\n`;
    text += `   Criada em: ${formatDateDisplay(list.createdAt)}\n`;
    text += `   Total: ${formatCurrency(listTotal)} (Pago: ${formatCurrency(listPaid)})\n`;
    text += `   Itens (${list.items.length}):\n`;

    if (list.items.length === 0) {
      text += `     (Nenhum item adicionado)\n`;
    } else {
      list.items.forEach((item) => {
        const cat = getCategoryById(item.category);
        const itemVal = calculateItemTotal(item);
        const status = item.isPaid ? '✅ PAGO' : '⏳ PENDENTE';

        let detail = '';
        if (item.weight && item.weight > 0) {
          detail = ` (${formatWeight(item.weight, item.weightUnit)} x ${formatCurrency(item.price)}/kg)`;
        } else if (item.quantity && item.quantity > 1) {
          detail = ` (${item.quantity}x ${formatCurrency(item.price)})`;
        }

        text += `     [${status}] ${item.name} - ${cat.name}: ${formatCurrency(itemVal)}${detail}\n`;
      });
    }

    text += `\n----------------------------------------\n\n`;
  });

  text += `ℹ️ DICA PARA TROCA DE CELULAR:\n`;
  text += `O arquivo anexado (.json) contém todos os seus dados em formato compatível com o aplicativo. Ao abrir o aplicativo em outro celular, basta importar este arquivo ou copiar o conteúdo para restaurar suas listas!\n`;

  return text;
}

export async function sendBackupToEmail(
  user: UserProfile,
  lists: ShoppingList[]
): Promise<{ success: boolean; method: 'email' | 'share'; message?: string }> {
  try {
    const payload = createBackupPayload(user, lists);
    const jsonString = JSON.stringify(payload, null, 2);
    const readableBody = formatReadableSummary(user, lists);

    // Save JSON to local file system
    const fileName = `backup_listas_compras_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isMailAvailable = await MailComposer.isAvailableAsync();

    if (isMailAvailable) {
      const result = await MailComposer.composeAsync({
        recipients: [user.email],
        subject: `🛒 Backup das Listas de Compras - ${new Date().toLocaleDateString('pt-BR')}`,
        body: readableBody,
        attachments: [fileUri],
      });

      return {
        success: result.status !== MailComposer.MailComposerStatus.CANCELLED,
        method: 'email',
        message: 'E-mail preparado com sucesso!',
      };
    }

    // Fallback if native mail composer is not set up: use Sharing
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: `Enviar backup para ${user.email}`,
        UTI: 'public.json',
      });
      return {
        success: true,
        method: 'share',
        message: 'Backup pronto para compartilhamento!',
      };
    }

    return {
      success: false,
      method: 'share',
      message: 'Não foi possível abrir o cliente de e-mail ou compartilhamento no dispositivo.',
    };
  } catch (error: any) {
    console.error('Error generating backup email:', error);
    throw new Error(error?.message || 'Falha ao gerar o envio por e-mail.');
  }
}
