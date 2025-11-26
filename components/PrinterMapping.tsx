import React, { useState } from 'react';

// 打印机映射配置
interface PrinterMapping {
  [roomId: string]: string; // roomId -> printerName
}

// 默认打印机映射配置
const DEFAULT_PRINTER_MAPPING: PrinterMapping = {
  'RM-808': '厨房打印机1',
  'RM-809': '厨房打印机1',
  'RM-901': '厨房打印机2',
  'RM-902': '厨房打印机2',
  'T-A01': '餐厅打印机1',
  'T-A02': '餐厅打印机1',
  'T-B01': '餐厅打印机2',
  'KTV-V01': 'KTV打印机1',
  'KTV-V02': 'KTV打印机1'
};

const PrinterMappingManager: React.FC = () => {
  const [mappings, setMappings] = useState<PrinterMapping>(DEFAULT_PRINTER_MAPPING);
  const [newRoomId, setNewRoomId] = useState('');
  const [newPrinter, setNewPrinter] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 添加新的映射
  const handleAddMapping = () => {
    if (newRoomId.trim() && newPrinter.trim()) {
      setMappings({
        ...mappings,
        [newRoomId.trim()]: newPrinter.trim()
      });
      setNewRoomId('');
      setNewPrinter('');
    }
  };

  // 开始编辑
  const startEditing = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  // 保存编辑
  const saveEditing = (key: string) => {
    if (editValue.trim()) {
      const updatedMappings = { ...mappings };
      delete updatedMappings[key];
      updatedMappings[key] = editValue.trim();
      setMappings(updatedMappings);
    }
    setEditingKey(null);
  };

  // 删除映射
  const deleteMapping = (key: string) => {
    const updatedMappings = { ...mappings };
    delete updatedMappings[key];
    setMappings(updatedMappings);
  };



  return (
    <div className="bg-paper p-6 rounded shadow-xl border-t-4 border-gold">
      <h2 className="text-xl font-bold text-ink mb-4">打印机映射配置</h2>
      
      {/* 添加新映射 */}
      <div className="mb-6 p-4 bg-stone-50 rounded border border-stone-200">
        <h3 className="font-bold text-stone-700 mb-3">添加新映射</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            placeholder="房间号 (如: RM-808)"
            className="p-2 border border-stone-300 rounded focus:border-gold focus:outline-none"
          />
          <input
            type="text"
            value={newPrinter}
            onChange={(e) => setNewPrinter(e.target.value)}
            placeholder="打印机名称"
            className="p-2 border border-stone-300 rounded focus:border-gold focus:outline-none"
          />
          <button
            onClick={handleAddMapping}
            className="bg-wood text-gold py-2 px-4 rounded font-bold hover:bg-black transition-colors"
          >
            添加映射
          </button>
        </div>
      </div>

      {/* 映射列表 */}
      <div>
        <h3 className="font-bold text-stone-700 mb-3">映射列表</h3>
        <div className="space-y-2">
          {Object.entries(mappings).map(([roomId, printer]) => (
            <div key={roomId} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded">
              {editingKey === roomId ? (
                <>
                  <span className="font-mono text-sm bg-stone-100 px-2 py-1 rounded">{roomId}</span>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 mx-3 p-1 border border-stone-300 rounded"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEditing(roomId)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700"
                  >
                    保存
                  </button>
                </>
              ) : (
                <>
                  <span className="font-mono text-sm bg-stone-100 px-2 py-1 rounded">{roomId}</span>
                  <span className="flex-1 mx-3 text-ink">{printer}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(roomId, printer)}
                      className="bg-stone-500 text-white px-3 py-1 rounded text-sm hover:bg-stone-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteMapping(roomId)}
                      className="bg-cinnabar text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold text-blue-800 mb-2">使用说明</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>房间号格式: 酒店客房(RM-808)、餐厅桌号(T-A01)、KTV包厢(KTV-V01)</li>
          <li>系统会根据房间号自动选择对应的打印机</li>
          <li>未配置的房间号将使用默认打印机</li>
          <li>可以在打印订单时通过 getPrinterForRoom(roomId) 获取对应的打印机</li>
        </ul>
      </div>
    </div>
  );
};

export default PrinterMappingManager;
export { DEFAULT_PRINTER_MAPPING };
export type { PrinterMapping };

// 获取房间号对应的打印机
export const getPrinterForRoom = (mappings: PrinterMapping, roomId: string): string => {
  return mappings[roomId] || '默认打印机';
};