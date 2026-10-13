"""Regression checks for source alignment and preservation; synthetic content only."""
import importlib.util
from pathlib import Path
import unittest
from lxml import etree

spec = importlib.util.spec_from_file_location('rebuild', Path(__file__).resolve().parents[1]/'tools/rebuild-private-bank.py')
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)

class RecoveryTests(unittest.TestCase):
    def test_decimal_is_not_question_number(self):
        self.assertEqual(r.source_no_strip('1.0N×2'), '1.0N×2')
        self.assertEqual(r.source_no_strip('12．【答案】3N'), '3N')

    def test_source_referenced_twice_does_not_duplicate_formula(self):
        q = {'id': 'q', 'source': 's', 'sourceNo': '1', 'sourceRefs': [{'file': 's', 'no': '1'}], 'stem': '已知量的关系与计算结果如下：F=，求压力。'}
        block = {'index': 3, 'plain': q['stem'], 'text': r'已知量的关系与计算结果如下：F=\(mg\)，求压力。', 'mathCount': 1, 'scriptCount': 0}
        c = {'no': '1', 'plain': q['stem'], 'text': block['text'], 'errors': [], 'blocks': [block]}
        records = {'s': {'sha256': 'x', 'records': {'stem': {'1': [c]}}}}
        fixes, pending = [], []
        r.apply_source(q, 'stem', records, fixes, pending)
        self.assertEqual(q['stem'].count(r'\(mg\)'), 1)
        self.assertEqual(len(fixes), 1)

    def test_teacher_edits_and_ambiguous_formulas_are_preserved(self):
        text = '原始情境中的计算关系如下：F=，求压力。'
        def doc(formula):
            b = {'index': 2, 'plain': text, 'text': text.replace('F=', r'F=\('+formula+r'\)'), 'mathCount': 1, 'scriptCount': 0}
            return {'sha256': 'x', 'records': {'stem': {'1': [{'no': '1', 'plain': text, 'text': b['text'], 'errors': [], 'blocks': [b]}]}}}
        q = {'id': 'q', 'stem': text, 'source': 's', 'sourceNo': '1', 'sourceRefs': [{'file': 't', 'no': '1'}]}
        fixes, pending = [], []
        r.apply_source(q, 'stem', {'s': doc('mg'), 't': doc('2mg')}, fixes, pending)
        self.assertEqual(q['stem'], text)
        self.assertFalse(fixes)
        q['qualityEditHistory'] = [{'changes': {'stem': text}}]
        r.apply_source(q, 'stem', {'s': doc('mg')}, fixes, pending)
        self.assertEqual(q['stem'], text)
        self.assertFalse(fixes)

    def test_native_fraction_and_text_scripts(self):
        math = etree.fromstring(f'<m:oMath xmlns:m="{r.M}"><m:f><m:num><m:r><m:t>F</m:t></m:r></m:num><m:den><m:r><m:t>S</m:t></m:r></m:den></m:f></m:oMath>')
        self.assertEqual(r.walk(math), r'\(\frac{F}{S}\)')
        run = etree.fromstring(f'<w:r xmlns:w="{r.W}"><w:rPr><w:vertAlign w:val="subscript"/></w:rPr><w:t>1</w:t></w:r>')
        self.assertEqual(r.walk(run), '₁')

    def test_flat_math_alignment_does_not_duplicate_number_or_unit(self):
        q = {'id': 'q', 'source': 's', 'sourceNo': '1', 'stem': '①按实验步骤测量，总质量为50g；'}
        block = {'index': 1, 'plain': '按实验步骤测量，总质量为50；', 'flat': q['stem'], 'text': r'\(①\)按实验步骤测量，总质量为50\(g\)；', 'mathCount': 2, 'scriptCount': 0}
        c = {'no': '1', 'plain': block['plain'], 'flat': block['flat'], 'text': block['text'], 'errors': [], 'blocks': [block]}
        records = {'s': {'sha256': 'x', 'records': {'stem': {'1': [c]}}}}
        fixes, pending = [], []
        r.apply_source(q, 'stem', records, fixes, pending)
        self.assertEqual(q['stem'], block['text'])
        self.assertEqual(q['stem'].count('①'), 1)
        self.assertEqual(q['stem'].count('g'), 1)

if __name__ == '__main__':
    unittest.main()
